"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState(null);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const res = await fetch("/api/interviews");
      if (res.ok) {
        const result = await res.json();
        setInterviewList(result);
      } else {
        setInterviewList([]);
      }
    } catch (err) {
      console.error(err);
      setInterviewList([]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-xl tracking-tight text-foreground">
        Previous Mock Interviews
      </h2>

      {interviewList === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-5 space-y-4 border-border/60 bg-card">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
              <div className="pt-2 flex gap-3">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : interviewList.length === 0 ? (
        <Card className="border border-dashed border-border bg-card/50 p-8 text-center my-3">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              No mock interviews yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              Click &quot;+ Start New Mock Interview&quot; above to create your first interview practice session.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {interviewList.map((interview, index) => (
            <InterviewItemCard key={index} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewList;
