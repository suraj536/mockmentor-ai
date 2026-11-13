"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, Volume2, VolumeX, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/useSpeech";

const QuestionSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  setActiveQuestionIndex,
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);

  const { isSupported, isSpeaking, isBlocked, speak, cancel } = useSpeech();

  // Load saved preferences safely after mount
  useEffect(() => {
    setHasMounted(true);
    try {
      const savedEnabled = localStorage.getItem("mock_mentor_voice_enabled");
      if (savedEnabled !== null) {
        setVoiceEnabled(savedEnabled === "true");
      }
      const savedSpeed = localStorage.getItem("mock_mentor_voice_speed");
      if (savedSpeed !== null) {
        const parsed = parseFloat(savedSpeed);
        if (!isNaN(parsed) && [0.85, 1, 1.15].includes(parsed)) {
          setVoiceSpeed(parsed);
        }
      }
    } catch (err) {
      // Ignore localStorage errors
    }
  }, []);

  // Track latest speed in ref so speak uses it without re-triggering auto-read on speed change
  const speedRef = useRef(voiceSpeed);
  useEffect(() => {
    speedRef.current = voiceSpeed;
  }, [voiceSpeed]);

  const currentQuestionText =
    mockInterviewQuestion?.[activeQuestionIndex]?.Question;

  // Auto-read effect: depends only on question text/index and voiceEnabled (NOT on speed)
  useEffect(() => {
    if (!hasMounted || !isSupported || !voiceEnabled || !currentQuestionText) {
      return;
    }

    speak(currentQuestionText, speedRef.current);

    return () => {
      cancel();
    };
  }, [
    activeQuestionIndex,
    currentQuestionText,
    voiceEnabled,
    hasMounted,
    isSupported,
    speak,
    cancel,
  ]);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mock_mentor_voice_enabled", String(next));
      } catch (err) {
        // Ignore localStorage errors
      }
      if (!next) {
        cancel(); // Turning voice off cancels any current speech
      }
      return next;
    });
  };

  const handleSpeedChange = (speed) => {
    setVoiceSpeed(speed);
    try {
      localStorage.setItem("mock_mentor_voice_speed", String(speed));
    } catch (err) {
      // Ignore localStorage errors
    }
  };

  if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
    return null;
  }

  const totalQuestions = mockInterviewQuestion.length;
  const progressPercent = Math.round(
    ((activeQuestionIndex + 1) / totalQuestions) * 100
  );

  return (
    <div className="flex flex-col justify-between p-6 border border-border/60 rounded-xl bg-card shadow-sm h-full space-y-6">
      <div className="space-y-5">
        {/* Progress & Pill header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>
              Question {activeQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {mockInterviewQuestion.map((_, index) => {
            const isActive = activeQuestionIndex === index;
            return (
              <button
                type="button"
                key={index}
                onClick={() => setActiveQuestionIndex?.(index)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Question #{index + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Text & Voice Controls */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
            {currentQuestionText}
          </h3>

          {/* AI Voice Interviewer Controls (Rendered after mount when supported) */}
          {hasMounted && isSupported && (
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice On/Off Toggle */}
                <Button
                  type="button"
                  variant={voiceEnabled ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleVoice}
                  aria-label={
                    voiceEnabled
                      ? "Turn voice reading off"
                      : "Turn voice reading on"
                  }
                  aria-pressed={voiceEnabled}
                  className="h-8 px-2.5 text-xs gap-1.5"
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-primary" />
                      <span>Voice On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Voice Off</span>
                    </>
                  )}
                </Button>

                {/* Replay / Stop Control */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isSpeaking) {
                      cancel();
                    } else if (currentQuestionText) {
                      speak(currentQuestionText, voiceSpeed);
                    }
                  }}
                  aria-label={
                    isSpeaking ? "Stop speaking question" : "Replay question"
                  }
                  className="h-8 px-2.5 text-xs gap-1.5"
                >
                  {isSpeaking ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current text-primary" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Replay</span>
                    </>
                  )}
                </Button>

                {/* Speed Selector */}
                <div
                  className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5"
                  role="group"
                  aria-label="Speech speed"
                >
                  {[0.85, 1, 1.15].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      aria-label={`Speech speed ${spd}x`}
                      aria-pressed={voiceSpeed === spd}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                        voiceSpeed === spd
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Blocked Autoplay Notice */}
              {isBlocked && (
                <p className="text-xs text-muted-foreground italic">
                  Tap Replay to hear the question
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Section */}
      <div className="border border-border/60 rounded-xl p-4 bg-muted/40">
        <div className="flex gap-2.5 items-start text-xs text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-foreground font-medium">Note:</strong>
            <p className="leading-relaxed">
              {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
                "Click on Record Answer when you are ready to answer the question. At the end of the interview, you will receive full feedback with ideal answers."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSection;
