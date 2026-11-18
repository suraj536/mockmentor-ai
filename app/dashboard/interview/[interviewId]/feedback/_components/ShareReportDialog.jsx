"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Share2,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import moment from "moment";

export default function ShareReportDialog({ interviewId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Form options
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);

  // Active state
  const [activeShare, setActiveShare] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [showReplaceForm, setShowReplaceForm] = useState(false);

  // Check active share status when dialog opens
  useEffect(() => {
    if (open && interviewId) {
      fetchShareStatus();
    } else {
      setConfirmRevoke(false);
      setShowReplaceForm(false);
    }
  }, [open, interviewId]);

  const fetchShareStatus = async () => {
    try {
      setCheckingStatus(true);
      const res = await fetch(`/api/interviews/${interviewId}/share`);
      if (res.ok) {
        const data = await res.json();
        setActiveShare(data?.activeShare || null);
      }
    } catch (_) {
      // Ignore network errors on background status check
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCreateShare = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/interviews/${interviewId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          includeAnswers,
          expiryDays: expiryDays === 0 ? null : expiryDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create share link");
      }

      const fullUrl = `${window.location.origin}/r/${data.token}`;
      setGeneratedUrl(fullUrl);
      setActiveShare({
        includeAnswers: data.includeAnswers,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
      });
      setShowReplaceForm(false);
      toast.success("Share link created successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const handleRevoke = async () => {
    try {
      setRevoking(true);
      const res = await fetch(`/api/interviews/${interviewId}/share`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to revoke share link");
      }
      setActiveShare(null);
      setGeneratedUrl(null);
      setConfirmRevoke(false);
      setShowReplaceForm(false);
      toast.success("Share link revoked. Access has been immediately turned off.");
    } catch (err) {
      toast.error(err.message || "Failed to revoke share link");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 print:hidden"
          aria-label="Create a public shareable report link"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Report</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full p-6 text-foreground sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="h-5 w-5 text-primary" />
            <span>Share Feedback Report</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
            Create an unguessable public link to share this feedback report with a recruiter or
            mentor without requiring them to sign in.
          </DialogDescription>
        </DialogHeader>

        {checkingStatus ? (
          <div className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Checking link status...</span>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Case 1: Just Generated a New URL */}
            {generatedUrl ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                    <Check className="h-4 w-4" />
                    <span>Your shareable link is ready!</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      readOnly
                      value={generatedUrl}
                      className="text-xs font-mono bg-background text-foreground h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 gap-1.5 h-9"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <p className="font-medium text-foreground">
                    ⚠️ Save or send this link now:
                  </p>
                  <p>
                    For your privacy, this URL is shown only once and is never stored in readable text
                    on our servers. A lost link cannot be retrieved, only replaced by creating a new
                    one (which automatically revokes the old one).
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGeneratedUrl(null);
                      fetchShareStatus();
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Done
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRevoke(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke Link
                  </Button>
                </div>
              </div>
            ) : activeShare && !showReplaceForm ? (
              /* Case 2: An Active Link Exists Already */
              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Active Share Link
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activeShare.expiresAt
                        ? `Expires ${moment(activeShare.expiresAt).fromNow()}`
                        : "Never expires"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Spoken answers:</strong>{" "}
                      {activeShare.includeAnswers ? "Included" : "Excluded (Scores & feedback only)"}
                    </p>
                    {activeShare.expiresAt && (
                      <p>
                        <strong>Expiration date:</strong>{" "}
                        {moment(activeShare.expiresAt).format("MMMM D, YYYY")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground space-y-1 leading-relaxed">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    Why can't I see the original URL?
                  </p>
                  <p className="text-muted-foreground">
                    To protect your privacy against database leaks, links are hashed and cannot be
                    displayed again. You can replace it with a new link or revoke it at any time.
                  </p>
                </div>

                {confirmRevoke ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Are you sure you want to revoke this link?</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Anyone opening this link will immediately see a 404 Not Found error.
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={revoking}
                        onClick={() => setConfirmRevoke(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={revoking}
                        onClick={handleRevoke}
                        className="h-8 text-xs gap-1.5"
                      >
                        {revoking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Confirm Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplaceForm(true)}
                      className="text-xs"
                    >
                      Replace with New Link
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmRevoke(true)}
                      className="text-xs gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke Access
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Case 3: Create New Link Form */
              <div className="space-y-4">
                {/* Spoken Answers Toggle */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="include-answers-toggle"
                      className="text-xs sm:text-sm font-medium text-foreground cursor-pointer"
                    >
                      Include my spoken answers
                    </label>
                    <input
                      id="include-answers-toggle"
                      type="checkbox"
                      checked={includeAnswers}
                      onChange={(e) => setIncludeAnswers(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Default OFF. When off, visitors only see the questions, scores, and AI feedback.
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                    Notice: Even without your spoken answers, AI feedback can quote or paraphrase what you said.
                  </p>
                </div>

                {/* Expiry Selector */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="share-expiry-select"
                    className="text-xs sm:text-sm font-medium text-foreground block"
                  >
                    Link Expiration
                  </label>
                  <select
                    id="share-expiry-select"
                    value={expiryDays === null ? "never" : String(expiryDays)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExpiryDays(val === "never" ? null : Number(val));
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="30">30 days (Recommended / Default)</option>
                    <option value="7">7 days (Quick review)</option>
                    <option value="never">Never expires (Permanent until revoked)</option>
                  </select>
                </div>

                {/* Privacy & Anti-Scraping Guarantee */}
                <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Non-Negotiable Privacy Protections</span>
                  </div>
                  <p>
                    • Your email, user ID, tech stack notes, and other interviews are never exposed.
                  </p>
                  <p>• Search engines are strictly blocked (noindex, nofollow).</p>
                  <p>
                    • Creating a new link automatically replaces and revokes any prior active link.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {showReplaceForm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplaceForm(false)}
                      className="text-xs"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleCreateShare}
                    disabled={loading}
                    className="gap-2 text-xs sm:text-sm"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Generate Share Link</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

