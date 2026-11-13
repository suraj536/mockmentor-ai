"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const page = ({ params }) => {
  const [questionData, setQuestionData] = useState();

  useEffect(() => {
    getQuestionDetails();
  }, []);

  const getQuestionDetails = async () => {
    try {
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
    }
  };



  return (
    questionData && (
    <div className="p-10 my-5">
      <Accordion type="single" collapsible>
        {questionData &&
          questionData.map((item, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index} className="mb-5"  >
              <AccordionTrigger>{item?.Question}?</AccordionTrigger>
              <AccordionContent>{item?.Answer}</AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
    )
  );
};

export default page;
