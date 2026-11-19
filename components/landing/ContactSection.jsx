"use client";

import React, { useState } from "react";
import { LoaderCircle, Send, Mail, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SectionReveal from "./ui/SectionReveal";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMsg) {
      toast.error("Please fill in all fields before sending.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMsg,
        }),
      });

      if (res.ok) {
        toast.success("Thank you! Your message has been received.");
        setName("");
        setEmail("");
        setMessage("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        let errorMsg = "Error recording response";
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) {}
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 border-t border-[#E8E8F2] dark:border-white/10 bg-brand-lavender/30 dark:bg-[#0E0C1B]/30 transition-colors"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-lavender dark:bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-3">
            <Mail className="h-3.5 w-3.5" />
            <span>Direct Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">
            Get in Touch
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted dark:text-neutral-400">
            Have questions or suggestions? Reach out and our team will get back to you promptly.
          </p>
        </SectionReveal>

        <SectionReveal className="max-w-2xl mx-auto" delay={0.1}>
          <div className="rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] p-6 sm:p-10 shadow-xl shadow-brand-primary/5">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-brand-muted dark:text-neutral-400 max-w-md mx-auto">
                  Thank you for reaching out. We have logged your response and will review your note shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-neutral-300"
                  >
                    Your Name
                  </label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-brand-lavender/40 dark:bg-white/5 border border-border/80 focus-visible:ring-2 focus-visible:ring-brand-primary text-sm"
                    maxLength={2000}
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-neutral-300"
                  >
                    Your Email
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-brand-lavender/40 dark:bg-white/5 border border-border/80 focus-visible:ring-2 focus-visible:ring-brand-primary text-sm"
                    maxLength={2000}
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-neutral-300"
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    placeholder="How can we help you prepare for your upcoming interviews?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="rounded-xl bg-brand-lavender/40 dark:bg-white/5 border border-border/80 focus-visible:ring-2 focus-visible:ring-brand-primary resize-none text-sm"
                    maxLength={5000}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white shadow-md hover:shadow-lg transition-all duration-200 gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

