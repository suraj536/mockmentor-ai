"use client";
import React, { useState, useEffect } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Headphones,
  Play,
  Pause,
  Volume2,
  Loader2,
} from "lucide-react";
import { useSpeech } from "@/lib/useSpeech";
import { useHandsFreeSession } from "@/lib/useHandsFreeSession";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [followUpRowId, setFollowUpRowId] = useState(null);

  // Shared speech instance to prevent conflicting AudioContexts or voices
  const speech = useSpeech();

  // Hands-free voice mode session coordinator
  const handsFree = useHandsFreeSession({
    mockInterviewQuestion,
    activeQuestionIndex,
    setActiveQuestionIndex,
    interviewData,
    followUpQuestion,
    setFollowUpQuestion,
    followUpRowId,
    setFollowUpRowId,
    useSpeechHook: speech,
  });

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}`);
      if (res.ok) {
        const result = await res.json();
        if (result && result[0]) {
          const jsonMockResp = JSON.parse(result[0].jsonMockResp);
          setMockInterviewQuestion(jsonMockResp);
          setInterviewData(result[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectQuestion = (index) => {
    setFollowUpQuestion(null);
    setFollowUpRowId(null);
    setActiveQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    setFollowUpQuestion(null);
    setFollowUpRowId(null);
    setActiveQuestionIndex((prev) => prev + 1);
  };

  const handlePrevQuestion = () => {
    setFollowUpQuestion(null);
    setFollowUpRowId(null);
    setActiveQuestionIndex((prev) => prev - 1);
  };

  const handleSkipFollowUp = () => {
    if (handsFree.isHandsFreeActive) {
      handsFree.skipFollowUp();
    } else {
      setFollowUpQuestion(null);
      setFollowUpRowId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Hands-Free Voice Mode Control Header */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/60 bg-card shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="hands-free-toggle" className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              id="hands-free-toggle"
              type="checkbox"
              checked={handsFree.isHandsFreeActive}
              onChange={(e) => handsFree.toggleHandsFree(e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle hands-free voice mode"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary relative" />
            <span className="text-xs sm:text-sm font-semibold text-foreground select-none flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Hands-Free Mode
            </span>
          </label>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground border-l border-border/60 pl-3">
            <Headphones className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Headphones recommended to avoid echo</span>
          </div>
        </div>

        {handsFree.isHandsFreeActive && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 text-foreground border border-border/60 max-w-full truncate"
            >
              {handsFree.status.startsWith("SPEAKING") && (
                <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse motion-reduce:animate-none shrink-0" />
              )}
              {handsFree.status.startsWith("LISTENING") && (
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
              {handsFree.status.startsWith("PROCESSING") && (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin motion-reduce:animate-none shrink-0" />
              )}
              <span className="truncate">{handsFree.statusMessage}</span>
            </div>

            {handsFree.status === "IDLE" && (
              <Button
                type="button"
                size="sm"
                onClick={handsFree.startSession}
                className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground shadow-sm"
              >
                <Play className="h-3.5 w-3.5" />
                Start Hands-Free
              </Button>
            )}

            {handsFree.status === "PAUSED" && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handsFree.resumeSession}
                className="gap-1.5 text-xs h-8"
              >
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                Resume
              </Button>
            )}

            {handsFree.isRunning && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handsFree.pauseSession}
                className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Completion Banner (When in COMPLETED state: NO auto-redirect) */}
      {handsFree.status === "COMPLETED" ? (
        <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-center space-y-4 my-8">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Interview Complete!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You have completed all {mockInterviewQuestion?.length || 5} questions. All answers and follow-ups have been evaluated.
          </p>
          <div className="pt-2">
            <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                View Feedback & Report
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Question Section */}
            <QuestionSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={handleSelectQuestion}
              followUpQuestion={followUpQuestion}
              onSkipFollowUp={handleSkipFollowUp}
              isHandsFreeActive={handsFree.isRunning}
              speechHook={speech}
            />

            {/* Video/audio Recording */}
            <RecordAnswerSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interviewData}
              followUpQuestion={followUpQuestion}
              setFollowUpQuestion={setFollowUpQuestion}
              followUpRowId={followUpRowId}
              setFollowUpRowId={setFollowUpRowId}
              isHandsFreeRunning={handsFree.isRunning}
              handsFreeStatus={handsFree.status}
              handsFreeMessage={handsFree.statusMessage}
              levelMeterRef={handsFree.levelMeterRef}
              onFinishNow={handsFree.finishNow}
              onRepeatQuestion={handsFree.repeatQuestion}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-border/60">
            {activeQuestionIndex > 0 && (
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={handlePrevQuestion}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Question
              </Button>
            )}

            {mockInterviewQuestion &&
              activeQuestionIndex !== mockInterviewQuestion.length - 1 && (
                <Button
                  className="gap-1.5"
                  onClick={handleNextQuestion}
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

            {mockInterviewQuestion &&
              activeQuestionIndex === mockInterviewQuestion.length - 1 && (
                <Link
                  href={"/dashboard/interview/" + interviewData?.mockId + "/feedback"}
                >
                  <Button className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    End Interview
                  </Button>
                </Link>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default StartInterview;
