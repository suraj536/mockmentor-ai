import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return "Recently";
  const date = moment(dateStr);
  if (!date.isValid()) return "Recently";
  const today = moment().startOf("day");
  const target = date.clone().startOf("day");
  const diffDays = today.diff(target, "days");
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.fromNow();
}

export function formatExperience(exp) {
  const num = Number(exp);
  if (!isNaN(num) && num === 1) {
    return "1 year experience";
  }
  return `${exp || 0} years experience`;
}

// Parses the STAR sentinel line prepended by evaluate/route.js for behavioral answers.
// Returns { star: { S, T, A, R }, text } when found, or { star: null, text } otherwise.
export function parseStarFeedback(feedbackText) {
  const match = feedbackText?.match(
    /^STAR:S=(\d+),T=(\d+),A=(\d+),R=(\d+)\n([\s\S]*)$/
  );
  if (!match) return { star: null, text: feedbackText ?? "" };
  return {
    star: { S: +match[1], T: +match[2], A: +match[3], R: +match[4] },
    text: match[5],
  };
}

export function normalizeQuestionKey(text) {
  if (typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}
