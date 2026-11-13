"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function getPreferredVoice(voices) {
  if (!voices || voices.length === 0) return null;

  const userLang =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language.toLowerCase()
      : "en-us";

  // 1. Prefer English voice matching navigator.language (e.g. en-IN, en-GB, en-US)
  const exactMatch = voices.find(
    (v) => v.lang && v.lang.toLowerCase() === userLang
  );
  if (exactMatch) return exactMatch;

  // 2. Voice matching the language tag prefix
  const langPrefixMatch = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith(userLang)
  );
  if (langPrefixMatch) return langPrefixMatch;

  // 3. Otherwise any English voice
  const anyEnglish = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith("en")
  );
  if (anyEnglish) return anyEnglish;

  // 4. Otherwise default voice or first voice
  return voices.find((v) => v.default) || voices[0] || null;
}

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [voices, setVoices] = useState([]);

  const utteranceRef = useRef(null);
  const speakTimeoutRef = useRef(null);

  // Initialize on mount: check support and load voices without reading window during initial render
  useEffect(() => {
    setMounted(true);

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          setVoices(v);
        }
      } catch (err) {
        // Ignore voice retrieval errors
      }
    };

    updateVoices();

    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    }

    return () => {
      if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // Ignore cancel errors
      }
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, rate = 1) => {
      if (
        !text ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)
      ) {
        return;
      }

      cancel();

      speakTimeoutRef.current = setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utteranceRef.current = utterance; // Prevent garbage collection before onend

          utterance.rate = Number(rate) || 1;

          const availableVoices =
            voices.length > 0 ? voices : window.speechSynthesis.getVoices();
          const voice = getPreferredVoice(availableVoices);
          if (voice) {
            utterance.voice = voice;
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsBlocked(false); // Clear blocked on next successful speech start
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            utteranceRef.current = null;
          };

          utterance.onerror = (event) => {
            // Ignore "interrupted" and "canceled"
            if (event.error === "interrupted" || event.error === "canceled") {
              setIsSpeaking(false);
              utteranceRef.current = null;
              return;
            }
            if (event.error === "not-allowed") {
              setIsBlocked(true);
            }
            setIsSpeaking(false);
            utteranceRef.current = null;
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("Speech synthesis error:", err);
          setIsSpeaking(false);
          utteranceRef.current = null;
        }
      }, 100);
    },
    [cancel, voices]
  );

  // Always cancel on unmount
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          // Ignore
        }
      }
      utteranceRef.current = null;
    };
  }, []);

  return {
    isSupported,
    mounted,
    isSpeaking,
    isBlocked,
    speak,
    cancel,
  };
}

