"use client";

import React from "react";
import { Lightbulb, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuestionSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  setActiveQuestionIndex,
}) => {
  const textToSpeech = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech.");
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

        {/* Current Question Text */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
              {mockInterviewQuestion[activeQuestionIndex]?.Question}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                textToSpeech(
                  mockInterviewQuestion[activeQuestionIndex]?.Question
                )
              }
              title="Listen to question"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Listen</span>
            </Button>
          </div>
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
