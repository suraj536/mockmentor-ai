"use client";
import React, { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (name && email && message) {
      setLoading(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            message,
          }),
        });

        if (res.ok) {
          toast("User Response recorded successfully");
          setName("");
          setEmail("");
          setMessage("");
        } else {
          let errorMsg = "Error recording response";
          try {
            const errData = await res.json();
            if (errData?.error) errorMsg = errData.error;
          } catch (_) {}
          toast(errorMsg);
        }
      } catch (error) {
        console.error(error);
        toast("Error recording response");
      } finally {
        setLoading(false);
      }
    } else {
      toast("No data entered");
    }
  };

  return (
    <Card className="max-w-xl mx-auto border-border/60 bg-card shadow-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Get in Touch
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1">
          Have questions or suggestions? Reach out and we will get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Name
            </label>
            <Input
              id="contact-name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Email
            </label>
            <Input
              id="contact-email"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message
            </label>
            <Textarea
              id="contact-message"
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base font-semibold gap-2 mt-2"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Contact;
