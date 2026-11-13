"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, Video, VideoOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { WebCamContext } from "@/app/dashboard/layout";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      updateUserAnswer();
    }
  }, [userAnswer]);

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
    try {
      setLoading(true);
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: mockInterviewQuestion[activeQuestionIndex]?.Question,
          userAnswer: userAnswer,
        }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to evaluate answer";
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        toast(errorMsg);
        setLoading(false);
        return;
      }

      const jsonFeedbackResp = await res.json();

      const resDb = await fetch(
        `/api/interviews/${interviewData?.mockId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: mockInterviewQuestion[activeQuestionIndex]?.Question,
            correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
            userAns: userAnswer,
            feedback: jsonFeedbackResp?.feedback,
            rating: String(jsonFeedbackResp?.rating ?? ""),
          }),
        }
      );

      if (resDb.ok) {
        toast("User Answer recorded successfully");
      } else {
        let errorMsg = "An error occurred while recording the user answer";
        try {
          const errData = await resDb.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        toast(errorMsg);
      }
      setUserAnswer("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast("An error occurred while recording the user answer");
      setLoading(false);
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
              Saving response...
            </span>
          ) : isRecording ? (
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse text-white" />
              Stop Recording...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Record Answer
            </span>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground max-w-sm">
        Click Record Answer and speak clearly. Click Stop Recording when finished to submit.
      </p>
    </div>
  );
};

export default RecordAnswerSection;
