"use client";
import React, { useState, useEffect } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

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

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Question Section */}
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          setActiveQuestionIndex={setActiveQuestionIndex}
        />

        {/* Video/audio Recording */}
        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-border/60">
        {activeQuestionIndex > 0 && (
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Question
          </Button>
        )}

        {mockInterviewQuestion &&
          activeQuestionIndex !== mockInterviewQuestion.length - 1 && (
            <Button
              className="gap-1.5"
              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
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
    </div>
  );
};

export default StartInterview;
