"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Page = ({ params }) => {
  const [questionData, setQuestionData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestionDetails();
  }, []);

  const getQuestionDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/questions/${params.pyqId}`);
      if (res.ok) {
        const result = await res.json();
        if (result && result[0]) {
          const parsed = JSON.parse(result[0].MockQuestionJsonResp);
          setQuestionData(parsed);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/dashboard/question">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          Practice Question Set
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Curated Interview Questions
        </h1>
        <p className="text-sm text-muted-foreground">
          Expand each question to review the recommended answers and study points.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Accordion Questions */}
      {!loading && questionData && (
        <Accordion type="single" collapsible className="space-y-4">
          {questionData.map((item, index) => (
            <AccordionItem
              value={`item-${index + 1}`}
              key={index}
              className="border border-border/60 rounded-xl bg-card px-5 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">
                    Q{index + 1}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">
                    {item?.Question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-1 border-t border-border/40 mt-1">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/40 space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                    Recommended Answer
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {item?.Answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Empty State */}
      {!loading && (!questionData || questionData.length === 0) && (
        <div className="border border-border/60 rounded-xl bg-card p-12 text-center shadow-sm">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No questions found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This question set does not contain any practice questions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
