"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, Video, VideoOff, Loader2, Check, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { WebCamContext } from "@/app/dashboard/layout";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  followUpQuestion,
  setFollowUpQuestion,
  followUpRowId,
  setFollowUpRowId,
  isHandsFreeRunning = false,
  handsFreeStatus = "DISABLED",
  handsFreeMessage = "",
  levelMeterRef = null,
  onFinishNow = null,
  onRepeatQuestion = null,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [mode, setMode] = useState(followUpQuestion ? "followup" : "main");
  const activeIndexRef = useRef(activeQuestionIndex);
  const lastMainAnswerRef = useRef("");
  const currentLang =
    mockInterviewQuestion?.[activeQuestionIndex]?.Lang || "en-US";

  useEffect(() => {
    activeIndexRef.current = activeQuestionIndex;
    setUserAnswer("");
    setLoading(false);
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [activeQuestionIndex]);

  useEffect(() => {
    if (followUpQuestion) {
      setMode("followup");
    } else {
      setMode("main");
    }
  }, [followUpQuestion]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      if (mode === "main") {
        updateUserAnswer();
      } else if (mode === "followup") {
        updateFollowUpAnswer();
      }
    }
  }, [userAnswer, isRecording, mode]);

  const startRecording = async () => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast(
        "Error starting recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true);
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result.split(",")[1];

          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Audio,
              mimeType: "audio/webm",
              lang: currentLang,
            }),
          });

          if (!res.ok) {
            let errorMsg = "Failed to transcribe audio";
            try {
              const errData = await res.json();
              if (errData?.error) errorMsg = errData.error;
            } catch (_) {}
            toast(errorMsg);
            setLoading(false);
            return;
          }

          const data = await res.json();
          const transcription = data.text || "";
          setUserAnswer((prevAnswer) => prevAnswer + " " + transcription);
          setLoading(false);
        } catch (err) {
          console.error("Error transcribing audio:", err);
          toast("Error transcribing audio. Please try again.");
          setLoading(false);
        }
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast("Error transcribing audio. Please try again.");
      setLoading(false);
    }
  };

  const updateUserAnswer = async () => {
    const capturedIndex = activeQuestionIndex;
    const capturedQuestion = mockInterviewQuestion?.[capturedIndex]?.Question;
    const capturedCorrectAns = mockInterviewQuestion?.[capturedIndex]?.Answer;
    const capturedType = mockInterviewQuestion?.[capturedIndex]?.Type ?? "technical";
    const answerToEvaluate = userAnswer;

    setUserAnswer("");
    setLoading(true);
    lastMainAnswerRef.current = answerToEvaluate;

    try {
      // 1. Evaluate and save main answer
      const evaluateAndSavePromise = (async () => {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: capturedQuestion,
            userAnswer: answerToEvaluate,
            type: capturedType,
            lang: currentLang,
          }),
        });

        if (!res.ok) {
          let errorMsg = "Failed to evaluate answer";
          try {
            const errData = await res.json();
            if (errData?.error) errorMsg = errData.error;
          } catch (_) {}
          throw new Error(errorMsg);
        }

        const jsonFeedbackResp = await res.json();

        const resDb = await fetch(
          `/api/interviews/${interviewData?.mockId}/answers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: capturedQuestion,
              correctAns: capturedCorrectAns,
              userAns: answerToEvaluate,
              feedback: jsonFeedbackResp?.feedback,
              rating: String(jsonFeedbackResp?.rating ?? ""),
            }),
          }
        );

        if (!resDb.ok) {
          let errorMsg = "An error occurred while recording the user answer";
          try {
            const errData = await resDb.json();
            if (errData?.error) errorMsg = errData.error;
          } catch (_) {}
          throw new Error(errorMsg);
        }

        const dbData = await resDb.json();
        return { jsonFeedbackResp, savedRowId: dbData?.id };
      })();

      // 2. Parallel follow-up check with strict 5-second timeout
      const followUpPromise = (async () => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);

          const res = await fetch("/api/followup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              interviewId: interviewData?.mockId,
              questionIndex: capturedIndex,
              userAnswer: answerToEvaluate,
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            return data?.followUp || null;
          }
          return null;
        } catch (_) {
          return null; // Silently fallback on timeout or error
        }
      })();

      const [saveResult, followUpText] = await Promise.all([
        evaluateAndSavePromise,
        followUpPromise,
      ]);

      // Race protection: ignore if user changed questions while waiting
      if (activeIndexRef.current !== capturedIndex) {
        setLoading(false);
        return;
      }

      toast("User Answer recorded successfully");

      if (followUpText && saveResult?.savedRowId) {
        setFollowUpRowId?.(saveResult.savedRowId);
        setFollowUpQuestion?.(followUpText);
        setMode("followup");
      } else {
        setFollowUpQuestion?.(null);
        setFollowUpRowId?.(null);
        setMode("main");
      }
    } catch (error) {
      if (activeIndexRef.current === capturedIndex) {
        toast(error.message || "An error occurred while recording the user answer");
      }
    } finally {
      if (activeIndexRef.current === capturedIndex) {
        setLoading(false);
      }
    }
  };

  const updateFollowUpAnswer = async () => {
    const capturedIndex = activeQuestionIndex;
    const capturedRowId = followUpRowId;
    const capturedQuestion = mockInterviewQuestion?.[capturedIndex]?.Question;
    const capturedType = mockInterviewQuestion?.[capturedIndex]?.Type ?? "technical";
    const followUpQ = followUpQuestion;
    const followUpAns = userAnswer;

    setUserAnswer("");
    setLoading(true);

    try {
      const originalAns = lastMainAnswerRef.current || "";
      const combinedAns = `${originalAns}\n---\nFollow-up: ${followUpQ}\nCandidate: ${followUpAns}`;

      // Re-evaluate combined answer with /api/evaluate
      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: capturedQuestion,
          userAnswer: combinedAns,
          type: capturedType,
          lang: currentLang,
        }),
      });

      if (!evalRes.ok) {
        let errorMsg = "Failed to evaluate follow-up answer";
        try {
          const errData = await evalRes.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const evalData = await evalRes.json();

      // PATCH the existing row with updated rating and feedback
      const patchRes = await fetch(
        `/api/interviews/${interviewData?.mockId}/answers`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answerId: capturedRowId,
            userAns: combinedAns,
            feedback: evalData?.feedback,
            rating: String(evalData?.rating ?? ""),
          }),
        }
      );

      if (!patchRes.ok) {
        let errorMsg = "Failed to update answer with follow-up";
        try {
          const errData = await patchRes.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      // Race protection
      if (activeIndexRef.current !== capturedIndex) {
        setLoading(false);
        return;
      }

      toast("Follow-up answer recorded successfully");
      setFollowUpQuestion?.(null);
      setFollowUpRowId?.(null);
      setMode("main");
    } catch (err) {
      if (activeIndexRef.current === capturedIndex) {
        toast(err.message || "An error occurred while updating follow-up answer");
      }
    } finally {
      if (activeIndexRef.current === capturedIndex) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 border border-border/60 rounded-xl bg-card shadow-sm h-full space-y-6">
      {/* Video Viewport */}
      <div className="w-full max-w-md aspect-video rounded-xl bg-muted/40 border border-border/60 overflow-hidden relative flex items-center justify-center">
        {webCamEnabled ? (
          <>
            <Webcam
              mirrored={true}
              className="w-full h-full object-cover"
              style={{ height: "100%", width: "100%", zIndex: 10 }}
            />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1.5 z-20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Image
              src="/camera.jpg"
              width={140}
              height={140}
              alt="Camera placeholder"
              className="rounded-lg opacity-80"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Camera is currently off
            </p>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-rose-500/90 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5 z-20 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white" />
            Recording
          </div>
        )}
      </div>

      {/* Controls */}
      {isHandsFreeRunning ? (
        <div className="w-full flex flex-col items-center gap-3 pt-2">
          <div
            role="status"
            aria-live="polite"
            className="w-full text-center p-3.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
              {handsFreeStatus.startsWith("SPEAKING") && (
                <Volume2 className="h-4 w-4 text-primary animate-pulse motion-reduce:animate-none" />
              )}
              {handsFreeStatus.startsWith("LISTENING") && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}
              {handsFreeStatus.startsWith("PROCESSING") && (
                <Loader2 className="h-4 w-4 text-primary animate-spin motion-reduce:animate-none" />
              )}
              <span>{handsFreeMessage}</span>
            </div>

            {handsFreeStatus.startsWith("LISTENING") && (
              <div className="w-full max-w-[220px] flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted-foreground shrink-0">Voice Level</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden border border-border/40">
                  <div
                    ref={levelMeterRef}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {handsFreeStatus.startsWith("LISTENING") && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onFinishNow}
                className="gap-1.5 text-xs h-8"
              >
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                I'm done
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRepeatQuestion}
                className="gap-1.5 text-xs h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Repeat question
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setWebCamEnabled((prev) => !prev)}
            className="text-xs text-muted-foreground gap-1.5"
          >
            {webCamEnabled ? (
              <>
                <VideoOff className="h-3.5 w-3.5" />
                Close WebCam
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5" />
                Enable WebCam
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setWebCamEnabled((prev) => !prev)}
            className="w-full sm:w-auto gap-2"
          >
            {webCamEnabled ? (
              <>
                <VideoOff className="h-4 w-4" />
                Close WebCam
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Enable WebCam
              </>
            )}
          </Button>

          <Button
            type="button"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className="w-full sm:w-auto gap-2 min-w-[160px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "followup" ? "Saving follow-up..." : "Saving response..."}
              </span>
            ) : isRecording ? (
              <span className="flex items-center gap-2">
                <Mic className="h-4 w-4 animate-pulse text-white" />
                Stop Recording...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                {mode === "followup" ? "Record Follow-up Answer" : "Record Answer"}
              </span>
            )}
          </Button>
        </div>
      )}

      {!isHandsFreeRunning && (
        <p className="text-xs text-center text-muted-foreground max-w-sm">
          {mode === "followup"
            ? "Click Record Follow-up Answer to respond, or click Skip follow-up on the left."
            : "Click Record Answer and speak clearly. Click Stop Recording when finished to submit."}
        </p>
      )}
    </div>
  );
};

export default RecordAnswerSection;
