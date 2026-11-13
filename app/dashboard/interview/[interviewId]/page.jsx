"use client";
import React, { useEffect, useState, useContext } from "react";
import Webcam from "react-webcam";
import Link from "next/link";
import {
  Lightbulb,
  WebcamIcon,
  Briefcase,
  Layers,
  Clock,
  ShieldCheck,
  Video,
  VideoOff,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebCamContext } from "../../layout";
import { formatExperience } from "@/lib/utils";

const Interview = ({ params }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [interviewData, setInterviewData] = useState();

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}`);
      if (res.ok) {
        const result = await res.json();
        setInterviewData(result[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Let's Get Started</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your interview details and test your audio and video before starting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Job Details & Info */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Interview Details
              </CardTitle>
              <CardDescription>Target role and requirements for this session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Job Role / Position
                </span>
                <p className="font-semibold text-base text-foreground mt-0.5">
                  {interviewData?.jobPosition || "Loading..."}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Job Description / Tech Stack
                </span>
                <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">
                  {interviewData?.jobDesc || "Not specified"}
                </p>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatExperience(interviewData?.jobExperience)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Important Information Card */}
          <Card className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-foreground">Information</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {process.env.NEXT_PUBLIC_INFORMATION}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Camera Preview & Controls */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Camera & Audio Setup
                </CardTitle>
                {webCamEnabled && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </span>
                )}
              </div>
              <CardDescription>Check your camera setup prior to entering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full aspect-video rounded-xl bg-muted/40 border border-border/60 flex items-center justify-center overflow-hidden relative">
                {webCamEnabled ? (
                  <Webcam
                    onUserMedia={() => setWebCamEnabled(true)}
                    onUserMediaError={() => setWebCamEnabled(false)}
                    height={300}
                    width={300}
                    mirrored={true}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <div className="p-4 rounded-full bg-muted mb-3">
                      <WebcamIcon className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Camera is disabled</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Enable your camera to preview your video before starting the session
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant={webCamEnabled ? "outline" : "default"}
                className="w-full gap-2"
                onClick={() => setWebCamEnabled((prev) => !prev)}
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

              {/* Privacy Note */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Your camera video is not recorded or uploaded. Your spoken answers are sent securely to Google Gemini for transcription and feedback.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Link href={"/dashboard/interview/" + params.interviewId + "/start"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start Interview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
