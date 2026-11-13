"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import QuestionItemCard from "./QuestionItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const QuestionList = () => {
  const { user } = useUser();
  const [questionList, setQuestionList] = useState(null);

  useEffect(() => {
    user && GetQuestionList();
  }, [user]);

  const GetQuestionList = async () => {
    try {
      const res = await fetch("/api/questions");
      if (res.ok) {
        const result = await res.json();
        setQuestionList(result);
      } else {
        setQuestionList([]);
      }
    } catch (err) {
      console.error(err);
      setQuestionList([]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-xl tracking-tight text-foreground">
        Previous Question Sets
      </h2>

      {questionList === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-5 space-y-4 border-border/60 bg-card">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
              <div className="pt-2">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : questionList.length === 0 ? (
        <Card className="border border-dashed border-border bg-card/50 p-8 text-center my-3">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              No question sets created yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              Click &quot;+ Add New Questions&quot; above to generate your first custom question set.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {questionList.map((question, index) => (
            <QuestionItemCard key={index} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
