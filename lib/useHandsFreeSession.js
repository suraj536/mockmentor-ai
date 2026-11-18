"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getLangLabel } from "@/lib/languages";

// --- ACTION TYPES ---
const ACTIONS = {
  ENABLE_HANDSFREE: "ENABLE_HANDSFREE",
  DISABLE_HANDSFREE: "DISABLE_HANDSFREE",
  START_SESSION: "START_SESSION",
  PAUSE_SESSION: "PAUSE_SESSION",
  RESUME_SESSION: "RESUME_SESSION",
  SPEECH_STARTED: "SPEECH_STARTED",
  ENTER_LISTENING_MAIN: "ENTER_LISTENING_MAIN",
  ENTER_PROCESSING_MAIN: "ENTER_PROCESSING_MAIN",
  ENTER_SPEAKING_FOLLOWUP: "ENTER_SPEAKING_FOLLOWUP",
  ENTER_LISTENING_FOLLOWUP: "ENTER_LISTENING_FOLLOWUP",
  ENTER_PROCESSING_FOLLOWUP: "ENTER_PROCESSING_FOLLOWUP",
  ENTER_TRANSITIONING: "ENTER_TRANSITIONING",
  ENTER_COMPLETED: "ENTER_COMPLETED",
  EMPTY_RECORDING_RETRY: "EMPTY_RECORDING_RETRY",
  SET_ERROR_PAUSE: "SET_ERROR_PAUSE",
};

// --- INITIAL STATE ---
const initialState = {
  status: "DISABLED", // DISABLED | IDLE | SPEAKING_QUESTION | LISTENING_MAIN | PROCESSING_MAIN | SPEAKING_FOLLOWUP | LISTENING_FOLLOWUP | PROCESSING_FOLLOWUP | TRANSITIONING | COMPLETED | PAUSED
  statusMessage: "Hands-free voice mode is off.",
  emptyRetryCount: 0,
  error: null,
};

// --- REDUCER ---
function handsFreeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ENABLE_HANDSFREE:
      return {
        ...state,
        status: "IDLE",
        statusMessage: "Hands-free mode enabled. Click Start to begin.",
        emptyRetryCount: 0,
        error: null,
      };

    case ACTIONS.DISABLE_HANDSFREE:
      return {
        ...state,
        status: "DISABLED",
        statusMessage: "Hands-free voice mode is off.",
        emptyRetryCount: 0,
        error: null,
      };

    case ACTIONS.START_SESSION:
      return {
        ...state,
        status: "SPEAKING_QUESTION",
        statusMessage: "AI Interviewer is speaking the question...",
        emptyRetryCount: 0,
        error: null,
      };

    case ACTIONS.PAUSE_SESSION:
      return {
        ...state,
        status: "PAUSED",
        statusMessage: action.payload?.message || "Hands-free mode paused.",
      };

    case ACTIONS.RESUME_SESSION:
      return {
        ...state,
        status: action.payload?.nextStatus || "SPEAKING_QUESTION",
        statusMessage: action.payload?.message || "Resuming hands-free session...",
        error: null,
      };

    case ACTIONS.SPEECH_STARTED:
      return {
        ...state,
        statusMessage: action.payload?.message || "AI Interviewer is speaking...",
      };

    case ACTIONS.ENTER_LISTENING_MAIN:
      return {
        ...state,
        status: "LISTENING_MAIN",
        statusMessage: "Listening for your answer... Speak clearly.",
        error: null,
      };

    case ACTIONS.ENTER_PROCESSING_MAIN:
      return {
        ...state,
        status: "PROCESSING_MAIN",
        statusMessage: "Processing and evaluating your answer...",
      };

    case ACTIONS.ENTER_SPEAKING_FOLLOWUP:
      return {
        ...state,
        status: "SPEAKING_FOLLOWUP",
        statusMessage: "AI Interviewer is speaking follow-up question...",
        emptyRetryCount: 0,
      };

    case ACTIONS.ENTER_LISTENING_FOLLOWUP:
      return {
        ...state,
        status: "LISTENING_FOLLOWUP",
        statusMessage: "Listening for your follow-up answer...",
        error: null,
      };

    case ACTIONS.ENTER_PROCESSING_FOLLOWUP:
      return {
        ...state,
        status: "PROCESSING_FOLLOWUP",
        statusMessage: "Evaluating follow-up and updating report...",
      };

    case ACTIONS.ENTER_TRANSITIONING:
      return {
        ...state,
        status: "TRANSITIONING",
        statusMessage: action.payload?.message || "Answer recorded! Moving to next question...",
        emptyRetryCount: 0,
      };

    case ACTIONS.ENTER_COMPLETED:
      return {
        ...state,
        status: "COMPLETED",
        statusMessage: "Interview complete! All questions have been evaluated.",
      };

    case ACTIONS.EMPTY_RECORDING_RETRY:
      return {
        ...state,
        emptyRetryCount: state.emptyRetryCount + 1,
        statusMessage: action.payload?.message || "We didn't hear an answer. Listening again...",
      };

    case ACTIONS.SET_ERROR_PAUSE:
      return {
        ...state,
        status: "PAUSED",
        statusMessage: action.payload?.message || "Hands-free paused due to an error.",
        error: action.payload?.error || null,
      };

    default:
      return state;
  }
}

// Best supported audio MIME type for recorder
function getSupportedMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "audio/webm";
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4"; // Safari
  }
  if (MediaRecorder.isTypeSupported("audio/aac")) {
    return "audio/aac";
  }
  return "";
}

export function useHandsFreeSession({
  mockInterviewQuestion,
  activeQuestionIndex,
  setActiveQuestionIndex,
  interviewData,
  followUpQuestion,
  setFollowUpQuestion,
  followUpRowId,
  setFollowUpRowId,
  useSpeechHook,
  voiceSpeed = 1,
}) {
  const [state, dispatch] = useReducer(handsFreeReducer, initialState);

  // Level meter ref for direct DOM updates (0 React state updates per frame)
  const levelMeterRef = useRef(null);

  // Session Token Ref: Increments on pause, skip, navigation, or unmount
  const sessionTokenRef = useRef(0);

  // Cross-step execution ref to prevent Temporal Dead Zone (TDZ) and circular dependency issues
  const stepsRef = useRef({});

  // Hardware & Audio stream references
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Watchdog and timeout timer references
  const speakingWatchdogRef = useRef(null);
  const processingWatchdogRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const maxAnswerTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Answer tracking
  const lastMainAnswerRef = useRef("");

  // Helper to increment session token (invalidates all pending callbacks/watchdogs)
  const bumpSessionToken = useCallback(() => {
    sessionTokenRef.current += 1;
    return sessionTokenRef.current;
  }, []);

  // --- PRIVACY: RELEASE MICROPHONE & AUDIO CONTEXT ---
  const releaseMic = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (levelMeterRef.current) {
      levelMeterRef.current.style.width = "0%";
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close().catch(() => {});
      } catch (_) {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Clear all pending timers
  const clearAllTimers = useCallback(() => {
    if (speakingWatchdogRef.current) {
      clearTimeout(speakingWatchdogRef.current);
      speakingWatchdogRef.current = null;
    }
    if (processingWatchdogRef.current) {
      clearTimeout(processingWatchdogRef.current);
      processingWatchdogRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (maxAnswerTimerRef.current) {
      clearTimeout(maxAnswerTimerRef.current);
      maxAnswerTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Safe mic acquisition with hardware echo cancellation
  const acquireMicStream = useCallback(async () => {
    if (streamRef.current && streamRef.current.active) {
      return streamRef.current;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;

    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      // NOTE: source is never connected to audioCtx.destination to prevent speaker feedback!

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
    }

    return stream;
  }, []);

  // --- ADVANCE TO NEXT QUESTION OR COMPLETE ---
  const advanceToNextQuestionOrComplete = useCallback(() => {
    const isLastQuestion =
      mockInterviewQuestion &&
      activeQuestionIndex >= mockInterviewQuestion.length - 1;

    if (isLastQuestion) {
      bumpSessionToken();
      clearAllTimers();
      releaseMic();
      dispatch({ type: ACTIONS.ENTER_COMPLETED });
    } else {
      dispatch({
        type: ACTIONS.ENTER_TRANSITIONING,
        payload: {
          message: `Saved! Moving to question ${activeQuestionIndex + 2}...`,
        },
      });

      // 1.5s delay before reading next question
      setTimeout(() => {
        if (state.status !== "DISABLED" && state.status !== "PAUSED") {
          setActiveQuestionIndex?.((prev) => prev + 1);
        }
      }, 1500);
    }
  }, [
    activeQuestionIndex,
    bumpSessionToken,
    clearAllTimers,
    mockInterviewQuestion,
    releaseMic,
    setActiveQuestionIndex,
    state.status,
  ]);

  // --- SPEAKING STEP WITH WATCHDOG ---
  const speakWithWatchdog = useCallback(
    (text, onFinished, targetLang = null) => {
      const currentToken = sessionTokenRef.current;
      clearAllTimers();

      let finishedFired = false;
      const handleFinished = () => {
        if (finishedFired) return;
        finishedFired = true;
        if (speakingWatchdogRef.current) {
          clearTimeout(speakingWatchdogRef.current);
          speakingWatchdogRef.current = null;
        }
        if (sessionTokenRef.current === currentToken) {
          onFinished();
        }
      };

      // Watchdog timeout calculation:
      // ~2.5 words per second at speed 1.0 + 3s grace buffer
      const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
      const speed = Number(voiceSpeed) || 1;
      const estimatedMs = ((wordCount / 2.5) / speed) * 1000;
      const watchdogMs = Math.max(3500, Math.round(estimatedMs + 3000));

      speakingWatchdogRef.current = setTimeout(() => {
        handleFinished();
      }, watchdogMs);

      // Trigger speech synthesis
      if (useSpeechHook && typeof useSpeechHook.speak === "function") {
        useSpeechHook.speak(text, speed, handleFinished, targetLang);
      } else {
        handleFinished();
      }
    },
    [clearAllTimers, voiceSpeed, useSpeechHook]
  );

  // --- STEP 1: SPEAK MAIN QUESTION ---
  const runSpeakingQuestion = useCallback(() => {
    const currentToken = bumpSessionToken();
    clearAllTimers();
    releaseMic(); // Privacy & Echo safety: mic completely off while speaking

    const currentQuestionObj = mockInterviewQuestion?.[activeQuestionIndex];
    const currentQuestion = currentQuestionObj?.Question;
    const currentLang = currentQuestionObj?.Lang || "en-US";
    if (!currentQuestion) return;

    dispatch({
      type: ACTIONS.SPEECH_STARTED,
      payload: { message: `AI is reading question ${activeQuestionIndex + 1}...` },
    });

    speakWithWatchdog(
      currentQuestion,
      () => {
        if (sessionTokenRef.current !== currentToken) return;

        // Advance immediately if voice fallback fired for non-English
        if (useSpeechHook?.voiceFallback && currentLang !== "en-US") {
          const label = getLangLabel(currentLang);
          dispatch({
            type: ACTIONS.ENTER_LISTENING_MAIN,
            payload: {
              message: `Question not spoken — no ${label} voice found on this device. Reading it on screen and listening now...`,
            },
          });
          stepsRef.current.startListeningAndRecording?.("main");
          return;
        }

        // Mandatory 400ms echo guard delay before opening microphone
        setTimeout(() => {
          if (sessionTokenRef.current === currentToken) {
            dispatch({ type: ACTIONS.ENTER_LISTENING_MAIN });
            stepsRef.current.startListeningAndRecording?.("main");
          }
        }, 400);
      },
      currentLang
    );
  }, [
    activeQuestionIndex,
    mockInterviewQuestion,
    bumpSessionToken,
    clearAllTimers,
    releaseMic,
    speakWithWatchdog,
    useSpeechHook?.voiceFallback,
  ]);

  // --- STEP 2: SPEAK FOLLOW-UP QUESTION ---
  const runSpeakingFollowUp = useCallback(
    (followUpText) => {
      const currentToken = bumpSessionToken();
      clearAllTimers();
      releaseMic();

      const currentQuestionObj = mockInterviewQuestion?.[activeQuestionIndex];
      const currentLang = currentQuestionObj?.Lang || "en-US";

      dispatch({
        type: ACTIONS.ENTER_SPEAKING_FOLLOWUP,
      });

      speakWithWatchdog(
        followUpText,
        () => {
          if (sessionTokenRef.current !== currentToken) return;

          // Advance immediately if voice fallback fired for non-English
          if (useSpeechHook?.voiceFallback && currentLang !== "en-US") {
            const label = getLangLabel(currentLang);
            dispatch({
              type: ACTIONS.ENTER_LISTENING_FOLLOWUP,
              payload: {
                message: `Question not spoken — no ${label} voice found on this device. Reading it on screen and listening now...`,
              },
            });
            stepsRef.current.startListeningAndRecording?.("followup");
            return;
          }

          // 400ms echo guard delay
          setTimeout(() => {
            if (sessionTokenRef.current === currentToken) {
              dispatch({ type: ACTIONS.ENTER_LISTENING_FOLLOWUP });
              stepsRef.current.startListeningAndRecording?.("followup");
            }
          }, 400);
        },
        currentLang
      );
    },
    [
      activeQuestionIndex,
      mockInterviewQuestion,
      bumpSessionToken,
      clearAllTimers,
      releaseMic,
      speakWithWatchdog,
      useSpeechHook?.voiceFallback,
    ]
  );

  // --- STEP 4: HANDLE INACTIVITY OR EMPTY RECORDINGS ---
  const handleInactivityTimeout = useCallback(
    (mode) => {
      clearAllTimers();
      releaseMic();

      if (state.emptyRetryCount < 2) {
        dispatch({
          type: ACTIONS.EMPTY_RECORDING_RETRY,
          payload: {
            message: "We didn't hear an answer. Listening again...",
          },
        });
        toast("We didn't hear an answer. Listening again...");

        // Re-open listening after 1 second
        setTimeout(() => {
          if (state.status !== "DISABLED" && state.status !== "PAUSED") {
            dispatch({
              type: mode === "followup" ? ACTIONS.ENTER_LISTENING_FOLLOWUP : ACTIONS.ENTER_LISTENING_MAIN,
            });
            stepsRef.current.startListeningAndRecording?.(mode);
          }
        }, 1000);
      } else {
        // Exceeded 2 retries: Pause session cleanly
        dispatch({
          type: ACTIONS.PAUSE_SESSION,
          payload: {
            message: "Hands-free paused due to inactivity. Click Resume when ready.",
          },
        });
        toast("Hands-free paused due to inactivity. Click Resume when ready.");
      }
    },
    [clearAllTimers, releaseMic, state.emptyRetryCount, state.status]
  );

  // --- STEP 5: AUDIO SUBMISSION & PROCESSING (WATCHDOG: 30s) ---
  const handleAudioSubmission = useCallback(
    async (audioBlob, cumulativeSpeechMs, mode, sessionToken) => {
      if (sessionTokenRef.current !== sessionToken) return;

      clearAllTimers();
      releaseMic();

      // Pre-flight gate 1: Tiny blob (< 2 KB) or < 1.5s detected speech -> treat as empty
      if (audioBlob.size < 2048 || cumulativeSpeechMs < 1500) {
        stepsRef.current.handleInactivityTimeout?.(mode);
        return;
      }

      // Pre-flight gate 2: Maximum 3 MB payload limit
      if (audioBlob.size > 3 * 1024 * 1024) {
        toast("Recording is too large (over 3 MB). Please provide a shorter answer.");
        dispatch({
          type: ACTIONS.PAUSE_SESSION,
          payload: {
            message: "Recording exceeded 3 MB limit. Hands-free paused.",
          },
        });
        return;
      }

      // Transition to processing state
      dispatch({
        type: mode === "followup" ? ACTIONS.ENTER_PROCESSING_FOLLOWUP : ACTIONS.ENTER_PROCESSING_MAIN,
      });

      // 30-Second Processing Watchdog
      processingWatchdogRef.current = setTimeout(() => {
        if (sessionTokenRef.current === sessionToken) {
          dispatch({
            type: ACTIONS.PAUSE_SESSION,
            payload: {
              message: "Processing timed out after 30 seconds. Hands-free paused.",
            },
          });
          toast("Processing took longer than expected. Hands-free has been paused.");
        }
      }, 30000);

      try {
        // Convert Blob to Base64
        const base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result;
            const b64 = typeof res === "string" ? res.split(",")[1] : null;
            if (b64) resolve(b64);
            else reject(new Error("Failed to encode audio"));
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        if (sessionTokenRef.current !== sessionToken) return;

        const capturedIndex = activeQuestionIndex;
        const capturedQuestionObj = mockInterviewQuestion?.[capturedIndex];
        const capturedQuestion = capturedQuestionObj?.Question;
        const capturedCorrectAns = capturedQuestionObj?.Answer;
        const capturedType = capturedQuestionObj?.Type ?? "technical";
        const capturedLang = capturedQuestionObj?.Lang || "en-US";

        // 1. Call /api/transcribe
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Audio,
            mimeType: audioBlob.type || "audio/webm",
            lang: capturedLang,
          }),
        });

        if (!transcribeRes.ok) {
          throw new Error("Failed to transcribe audio");
        }

        const transcribeData = await transcribeRes.json();
        const transcription = (transcribeData?.text || "").trim();

        if (sessionTokenRef.current !== sessionToken) return;

        // Pre-flight gate 3: Empty or <= 10 characters -> treat as empty
        if (!transcription || transcription.length <= 10) {
          stepsRef.current.handleInactivityTimeout?.(mode);
          return;
        }

        if (mode === "main") {
          lastMainAnswerRef.current = transcription;

          // Parallel: Evaluation + Save Main Answer, and Follow-up Check (5s timeout)
          const evaluateAndSavePromise = (async () => {
            const evalRes = await fetch("/api/evaluate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: capturedQuestion,
                userAnswer: transcription,
                type: capturedType,
                lang: capturedLang,
              }),
            });
            if (!evalRes.ok) throw new Error("Evaluation failed");
            const evalJson = await evalRes.json();

            const dbRes = await fetch(
              `/api/interviews/${interviewData?.mockId}/answers`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: capturedQuestion,
                  correctAns: capturedCorrectAns,
                  userAns: transcription,
                  feedback: evalJson?.feedback,
                  rating: String(evalJson?.rating ?? ""),
                }),
              }
            );
            if (!dbRes.ok) throw new Error("Saving answer failed");
            const dbData = await dbRes.json();
            return { evalJson, savedRowId: dbData?.id };
          })();

          const followUpPromise = (async () => {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 5000);
              const fuRes = await fetch("/api/followup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  interviewId: interviewData?.mockId,
                  questionIndex: capturedIndex,
                  userAnswer: transcription,
                }),
                signal: controller.signal,
              });
              clearTimeout(timer);
              if (fuRes.ok) {
                const fuData = await fuRes.json();
                return fuData?.followUp || null;
              }
              return null;
            } catch (_) {
              return null;
            }
          })();

          const [saveResult, followUpText] = await Promise.all([
            evaluateAndSavePromise,
            followUpPromise,
          ]);

          if (sessionTokenRef.current !== sessionToken) return;
          clearAllTimers(); // Clear 30s processing watchdog

          toast("User Answer recorded successfully");

          if (followUpText && saveResult?.savedRowId) {
            setFollowUpRowId?.(saveResult.savedRowId);
            setFollowUpQuestion?.(followUpText);
            stepsRef.current.runSpeakingFollowUp?.(followUpText);
          } else {
            setFollowUpQuestion?.(null);
            setFollowUpRowId?.(null);
            stepsRef.current.advanceToNextQuestionOrComplete?.();
          }
        } else if (mode === "followup") {
          // Re-evaluate combined thread
          const originalAns = lastMainAnswerRef.current || "";
          const combinedAns = `${originalAns}\n---\nFollow-up: ${followUpQuestion}\nCandidate: ${transcription}`;

          const evalRes = await fetch("/api/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: capturedQuestion,
              userAnswer: combinedAns,
              type: capturedType,
              lang: capturedLang,
            }),
          });
          if (!evalRes.ok) throw new Error("Follow-up evaluation failed");
          const evalJson = await evalRes.json();

          const patchRes = await fetch(
            `/api/interviews/${interviewData?.mockId}/answers`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                answerId: followUpRowId,
                userAns: combinedAns,
                feedback: evalJson?.feedback,
                rating: String(evalJson?.rating ?? ""),
              }),
            }
          );
          if (!patchRes.ok) throw new Error("Updating answer failed");

          if (sessionTokenRef.current !== sessionToken) return;
          clearAllTimers();

          toast("Follow-up recorded successfully");
          setFollowUpQuestion?.(null);
          setFollowUpRowId?.(null);
          stepsRef.current.advanceToNextQuestionOrComplete?.();
        }
      } catch (err) {
        if (sessionTokenRef.current === sessionToken) {
          clearAllTimers();
          dispatch({
            type: ACTIONS.PAUSE_SESSION,
            payload: {
              message: `Error during processing: ${err.message || "Request failed"}. Hands-free paused.`,
            },
          });
          toast(err.message || "An error occurred while processing answer.");
        }
      }
    },
    [
      activeQuestionIndex,
      clearAllTimers,
      followUpQuestion,
      followUpRowId,
      interviewData?.mockId,
      mockInterviewQuestion,
      releaseMic,
      setFollowUpQuestion,
      setFollowUpRowId,
    ]
  );

  // --- STEP 3: START LISTENING & RECORDING (SILENCE DETECTION) ---
  const startListeningAndRecording = useCallback(
    async (mode) => {
      const currentToken = sessionTokenRef.current;
      clearAllTimers();
      recordedChunksRef.current = [];

      let stream;
      try {
        stream = await acquireMicStream();
      } catch (err) {
        if (sessionTokenRef.current !== currentToken) return;
        releaseMic();
        dispatch({
          type: ACTIONS.SET_ERROR_PAUSE,
          payload: {
            message: "Microphone access denied or unavailable. Hands-free paused.",
            error: err.message,
          },
        });
        toast("Microphone access is required for Hands-free mode. Please check browser permissions.");
        return;
      }

      if (sessionTokenRef.current !== currentToken) {
        releaseMic();
        return;
      }

      // Initialize MediaRecorder
      const mimeType = getSupportedMimeType();
      let recorder;
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch (_) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = recorder;

      // Silence & Speech Tracking Variables
      let calibrationFrames = 0;
      let noiseSum = 0;
      let ambientNoiseFloor = 0.02;
      let speechThreshold = 0.04;
      let speechStarted = false;
      let cumulativeSpeechMs = 0;
      let lastFrameTime = performance.now();
      let speechEndedFired = false;

      const finishAnswer = () => {
        if (speechEndedFired) return;
        speechEndedFired = true;
        clearAllTimers();

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.onstop = () => {
            const recordedMime = recorder.mimeType || mimeType || "audio/webm";
            const audioBlob = new Blob(recordedChunksRef.current, { type: recordedMime });
            stepsRef.current.handleAudioSubmission?.(audioBlob, cumulativeSpeechMs, mode, currentToken);
          };
          try {
            mediaRecorderRef.current.stop();
          } catch (_) {}
        }
      };

      // 8-second Inactivity Timeout: If 0 speech detected within 8s
      inactivityTimerRef.current = setTimeout(() => {
        if (!speechStarted && sessionTokenRef.current === currentToken) {
          stepsRef.current.handleInactivityTimeout?.(mode);
        }
      }, 8000);

      // 3-minute Maximum Answer Cap (180s)
      maxAnswerTimerRef.current = setTimeout(() => {
        if (sessionTokenRef.current === currentToken) {
          toast("Maximum answer duration reached (3 mins).");
          finishAnswer();
        }
      }, 180000);

      // Web Audio Analysis Loop (60 FPS)
      const analyser = analyserRef.current;
      const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

      const checkAudioLevel = () => {
        if (sessionTokenRef.current !== currentToken) return;

        const now = performance.now();
        const deltaMs = now - lastFrameTime;
        lastFrameTime = now;

        if (analyser && dataArray) {
          analyser.getByteTimeDomainData(dataArray);

          // Calculate RMS volume
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);

          // Direct DOM level meter update (no React re-renders)
          if (levelMeterRef.current) {
            const pct = Math.min(100, Math.round(rms * 450));
            levelMeterRef.current.style.width = `${pct}%`;
          }

          // Dynamic Noise Floor Calibration (First 400ms)
          if (calibrationFrames < 24) {
            noiseSum += rms;
            calibrationFrames += 1;
            if (calibrationFrames === 24) {
              const measuredAvg = noiseSum / 24;
              // Cap measured floor at 0.08 so early speech is not mistaken for a noisy room
              ambientNoiseFloor = Math.min(measuredAvg, 0.08);
              speechThreshold = Math.max(ambientNoiseFloor * 2.2, 0.04);
            }
          } else {
            // Speech detection
            const isSpeakingNow = rms >= speechThreshold;

            if (isSpeakingNow) {
              if (!speechStarted) {
                speechStarted = true;
                // Speech begun: cancel the 8-second inactivity timer
                if (inactivityTimerRef.current) {
                  clearTimeout(inactivityTimerRef.current);
                  inactivityTimerRef.current = null;
                }
              }
              cumulativeSpeechMs += deltaMs;

              // Clear silence timer while candidate is actively speaking
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }
            } else if (speechStarted) {
              // Candidate paused: start 2.5s silence countdown if not already running
              if (!silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(() => {
                  finishAnswer();
                }, 2500);
              }
            }
          }
        }

        if (!speechEndedFired) {
          animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        }
      };

      try {
        recorder.start(250); // collect chunks every 250ms
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      } catch (err) {
        releaseMic();
        dispatch({
          type: ACTIONS.SET_ERROR_PAUSE,
          payload: { message: "Could not start audio recorder.", error: err.message },
        });
      }
    },
    [acquireMicStream, clearAllTimers, releaseMic]
  );

  // Sync latest function references into stepsRef on every render
  stepsRef.current = {
    runSpeakingQuestion,
    runSpeakingFollowUp,
    startListeningAndRecording,
    handleInactivityTimeout,
    handleAudioSubmission,
    advanceToNextQuestionOrComplete,
  };

  // When activeQuestionIndex changes while in active hands-free, start speaking new question
  useEffect(() => {
    if (
      state.status !== "DISABLED" &&
      state.status !== "IDLE" &&
      state.status !== "PAUSED" &&
      state.status !== "COMPLETED"
    ) {
      runSpeakingQuestion();
    }
  }, [activeQuestionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- TAB VISIBILITY CHANGE LISTENER ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (
          state.status !== "DISABLED" &&
          state.status !== "IDLE" &&
          state.status !== "PAUSED" &&
          state.status !== "COMPLETED"
        ) {
          bumpSessionToken();
          clearAllTimers();
          releaseMic();
          if (useSpeechHook && typeof useSpeechHook.cancel === "function") {
            useSpeechHook.cancel();
          }
          dispatch({
            type: ACTIONS.PAUSE_SESSION,
            payload: {
              message: "Hands-free paused while tab was in background. Click Resume to continue.",
            },
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [bumpSessionToken, clearAllTimers, releaseMic, state.status, useSpeechHook]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bumpSessionToken();
      clearAllTimers();
      releaseMic();
    };
  }, [bumpSessionToken, clearAllTimers, releaseMic]);

  // --- PUBLIC ACTIONS ---
  const toggleHandsFree = useCallback(
    (enabled) => {
      bumpSessionToken();
      clearAllTimers();
      releaseMic();
      if (useSpeechHook && typeof useSpeechHook.cancel === "function") {
        useSpeechHook.cancel();
      }

      if (enabled) {
        dispatch({ type: ACTIONS.ENABLE_HANDSFREE });
      } else {
        dispatch({ type: ACTIONS.DISABLE_HANDSFREE });
      }
    },
    [bumpSessionToken, clearAllTimers, releaseMic, useSpeechHook]
  );

  const startSession = useCallback(async () => {
    try {
      // Blessed user gesture: prompt mic & AudioContext
      await acquireMicStream();
      dispatch({ type: ACTIONS.START_SESSION });
      runSpeakingQuestion();
    } catch (err) {
      toast("Microphone access is required for Hands-free mode. Please check browser settings.");
      dispatch({
        type: ACTIONS.SET_ERROR_PAUSE,
        payload: {
          message: "Microphone permission denied. Hands-free paused.",
          error: err.message,
        },
      });
    }
  }, [acquireMicStream, runSpeakingQuestion]);

  const pauseSession = useCallback(() => {
    bumpSessionToken();
    clearAllTimers();
    releaseMic();
    if (useSpeechHook && typeof useSpeechHook.cancel === "function") {
      useSpeechHook.cancel();
    }
    dispatch({
      type: ACTIONS.PAUSE_SESSION,
      payload: { message: "Hands-free paused by candidate." },
    });
  }, [bumpSessionToken, clearAllTimers, releaseMic, useSpeechHook]);

  const resumeSession = useCallback(async () => {
    try {
      await acquireMicStream();
      dispatch({
        type: ACTIONS.RESUME_SESSION,
        payload: {
          nextStatus: "SPEAKING_QUESTION",
          message: "Resuming hands-free session...",
        },
      });
      runSpeakingQuestion();
    } catch (err) {
      toast("Microphone access is required to resume.");
    }
  }, [acquireMicStream, runSpeakingQuestion]);

  // In-listening button: "I'm done" (immediately ends the answer)
  const finishNow = useCallback(() => {
    if (
      (state.status === "LISTENING_MAIN" || state.status === "LISTENING_FOLLOWUP") &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      clearAllTimers();
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
  }, [clearAllTimers, state.status]);

  // In-listening button: "Repeat question"
  const repeatQuestion = useCallback(() => {
    bumpSessionToken();
    clearAllTimers();
    releaseMic();
    if (useSpeechHook && typeof useSpeechHook.cancel === "function") {
      useSpeechHook.cancel();
    }
    if (state.status === "LISTENING_FOLLOWUP" && followUpQuestion) {
      runSpeakingFollowUp(followUpQuestion);
    } else {
      runSpeakingQuestion();
    }
  }, [
    bumpSessionToken,
    clearAllTimers,
    followUpQuestion,
    releaseMic,
    runSpeakingFollowUp,
    runSpeakingQuestion,
    state.status,
    useSpeechHook,
  ]);

  // Skip follow-up button handler
  const skipFollowUp = useCallback(() => {
    bumpSessionToken();
    clearAllTimers();
    releaseMic();
    if (useSpeechHook && typeof useSpeechHook.cancel === "function") {
      useSpeechHook.cancel();
    }
    setFollowUpQuestion?.(null);
    setFollowUpRowId?.(null);
    stepsRef.current.advanceToNextQuestionOrComplete?.();
  }, [
    bumpSessionToken,
    clearAllTimers,
    releaseMic,
    setFollowUpQuestion,
    setFollowUpRowId,
    useSpeechHook,
  ]);

  return {
    status: state.status,
    statusMessage: state.statusMessage,
    emptyRetryCount: state.emptyRetryCount,
    isHandsFreeActive: state.status !== "DISABLED",
    isRunning:
      state.status !== "DISABLED" &&
      state.status !== "IDLE" &&
      state.status !== "PAUSED" &&
      state.status !== "COMPLETED",
    levelMeterRef,
    toggleHandsFree,
    startSession,
    pauseSession,
    resumeSession,
    finishNow,
    repeatQuestion,
    skipFollowUp,
  };
}
