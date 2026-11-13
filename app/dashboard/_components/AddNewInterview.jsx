"use client";
import React, { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, PlusCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interview",
          jobPosition,
          jobDesc,
          jobExperience,
        }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to generate questions";
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        toast(errorMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const MockJsonResp = data.jsonResponse;
      JSON.parse(MockJsonResp);
      // const parsedResp = MockJsonResp
      setJsonResponse(MockJsonResp);

      if (MockJsonResp) {
        const dbRes = await fetch("/api/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonMockResp: MockJsonResp,
            jobPosition: jobPosition,
            jobDesc: jobDesc,
            jobExperience: jobExperience,
          }),
        });

        if (!dbRes.ok) {
          let errorMsg = "Failed to save interview";
          try {
            const errData = await dbRes.json();
            if (errData?.error) errorMsg = errData.error;
          } catch (_) {}
          toast(errorMsg);
          setLoading(false);
          return;
        }

        const resp = await dbRes.json();

        if (resp) {
          setOpenDialog(false);
          router.push("/dashboard/interview/" + resp[0]?.mockId);
        }
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-xl border border-dashed border-border bg-card p-6 sm:p-8 hover:border-primary/60 hover:bg-muted/20 transition-all duration-300 cursor-pointer shadow-sm"
        onClick={() => setOpenDialog(true)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              + Start New Mock Interview
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Practice role-specific interview questions with instant AI audio evaluation.
            </p>
          </div>
        </div>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="my-3">
                  <h2 className="text-muted-foreground text-sm">
                    Add Details about your job position, job description and
                    years of experience
                  </h2>

                  <div className="mt-7 my-3">
                    <label className="text-sm font-medium text-foreground">Job Role/job Position</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. Full stack Developer"
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-sm font-medium text-foreground">
                      Job Description(In Short)
                    </label>
                    <Textarea
                      className="placeholder-opacity-50 mt-1"
                      placeholder="Ex. React, Angular, Nodejs, Mysql, Nosql, Python"
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-sm font-medium text-foreground">Years of Experience</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. 5"
                      max="50"
                      type="number"
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Generating From AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
