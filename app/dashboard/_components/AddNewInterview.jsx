"use client";
import React, { useState, useRef } from "react";

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
import { LoaderCircle, PlusCircle, FileText, UploadCloud, X, Briefcase, ChevronDown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, DEFAULT_LANG } from "@/lib/languages";

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const [interviewType, setInterviewType] = useState("technical");
  const [interviewLang, setInterviewLang] = useState(DEFAULT_LANG);
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [isPostingExpanded, setIsPostingExpanded] = useState(false);
  const [postingError, setPostingError] = useState("");
  const fileInputRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();

  const resetForm = () => {
    setInterviewType("technical");
    setInterviewLang(DEFAULT_LANG);
    handleRemoveFile();
    setJobPosting("");
    setIsPostingExpanded(false);
    setPostingError("");
  };

  const handleFileSelect = (file) => {
    setFileError("");
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFileError("Invalid file type. Please upload a PDF document.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size === 0) {
      setFileError("Uploaded resume file is empty.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFileError("File size exceeds 3 MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const trimmedPosting = (jobPosting || "").trim();
    if (trimmedPosting.length > 0 && trimmedPosting.length < 50) {
      setPostingError("Job posting must be at least 50 characters, or clear the field.");
      toast("Job posting is too short. Please provide at least 50 characters or clear the field.");
      return;
    }
    if (trimmedPosting.length > 6000) {
      setPostingError("Job posting exceeds the 6,000 character limit.");
      toast("Job posting exceeds the 6,000 character limit.");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("mode", "interview");
        formData.append("jobPosition", jobPosition);
        formData.append("jobDesc", jobDesc);
        formData.append("jobExperience", jobExperience);
        formData.append("type", interviewType);
        formData.append("lang", interviewLang);
        if (trimmedPosting) {
          formData.append("jobPosting", trimmedPosting);
        }
        formData.append("resume", resumeFile);

        res = await fetch("/api/generate-questions", {
          method: "POST",
          body: formData,
        });
      } else {
        const payload = {
          mode: "interview",
          jobPosition,
          jobDesc,
          jobExperience,
          type: interviewType,
          lang: interviewLang,
        };
        if (trimmedPosting) {
          payload.jobPosting = trimmedPosting;
        }

        res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

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
          resetForm();
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
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) {
            resetForm();
          }
        }}
      >
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

                  {/* Interview Type Selector */}
                  <div className="mt-7 my-3">
                    <label className="text-sm font-medium text-foreground">
                      Interview Type
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        variant={interviewType === "technical" ? "default" : "outline"}
                        aria-pressed={interviewType === "technical"}
                        onClick={() => setInterviewType("technical")}
                        className="flex-1"
                      >
                        Technical
                      </Button>
                      <Button
                        type="button"
                        variant={interviewType === "behavioral" ? "default" : "outline"}
                        aria-pressed={interviewType === "behavioral"}
                        onClick={() => setInterviewType("behavioral")}
                        className="flex-1"
                      >
                        Behavioral (STAR)
                      </Button>
                    </div>
                  </div>

                  {/* Interview Language */}
                  <div className="mt-5 my-3">
                    <label
                      htmlFor="interview-language-select"
                      className="text-sm font-medium text-foreground block mb-1.5"
                    >
                      Interview Language
                    </label>
                    <select
                      id="interview-language-select"
                      value={interviewLang}
                      onChange={(e) => setInterviewLang(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.nativeName} ({l.label})
                        </option>
                      ))}
                    </select>
                  </div>

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

                  {/* Collapsible Target Job Posting (Optional) */}
                  <div className="my-5 rounded-lg border border-border/60 bg-muted/20 p-3 sm:p-4 transition-all">
                    <button
                      type="button"
                      onClick={() => setIsPostingExpanded((prev) => !prev)}
                      className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                      aria-expanded={isPostingExpanded}
                      aria-controls="target-job-posting-panel"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Target Job Posting <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isPostingExpanded && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isPostingExpanded && (
                      <div id="target-job-posting-panel" className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Paste the full job listing (responsibilities, required qualifications, and domain) to tailor the interview questions directly to the role.
                        </p>
                        <Textarea
                          id="target-job-posting"
                          value={jobPosting}
                          onChange={(e) => {
                            const val = e.target.value;
                            setJobPosting(val);
                            const len = val.trim().length;
                            if (len > 0 && len < 50) {
                              setPostingError("Must be at least 50 characters, or clear the field.");
                            } else if (len > 6000) {
                              setPostingError("Exceeds 6,000 character limit.");
                            } else {
                              setPostingError("");
                            }
                          }}
                          placeholder="Paste responsibilities, must-have skills, qualifications, or requirements from the job posting..."
                          maxLength={6000}
                          rows={5}
                          className="mt-1 text-sm bg-background resize-y min-h-[110px]"
                          aria-label="Target job posting text"
                          aria-describedby="job-posting-counter job-posting-error"
                        />
                        <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              id="job-posting-counter"
                              className={cn(
                                "font-medium",
                                jobPosting.length > 5500
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              )}
                            >
                              {jobPosting.length.toLocaleString()} / 6,000 characters
                            </span>
                            {postingError && (
                              <span id="job-posting-error" className="text-destructive font-medium">
                                • {postingError}
                              </span>
                            )}
                          </div>
                          {jobPosting.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setJobPosting("");
                                setPostingError("");
                              }}
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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

                  {/* Resume Upload Section */}
                  <div className="my-5">
                    <label className="text-sm font-medium text-foreground block">
                      Resume <span className="text-xs text-muted-foreground font-normal">(Optional, PDF only, max 3 MB)</span>
                    </label>

                    {!resumeFile ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            handleFileSelect(files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/20 transition-all duration-200"
                      >
                        <UploadCloud className="h-7 w-7 text-muted-foreground mb-1" />
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          PDF format up to 3 MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">
                              {resumeFile.name}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={handleRemoveFile}
                          aria-label="Remove resume"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {fileError && (
                      <p className="text-xs text-destructive mt-1.5 font-medium">
                        {fileError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setOpenDialog(false);
                    }}
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
