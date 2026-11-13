import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return "Recently";
  const date = moment(dateStr, "YYYY-MM-DD");
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
