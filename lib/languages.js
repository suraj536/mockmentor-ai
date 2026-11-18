// Supported interview languages. English (en-US) is the default; all other
// languages require explicit selection. Only add languages that use LTR script
// and that Gemini reliably generates structured JSON for.
export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English",    nativeName: "English"    },
  { code: "hi-IN", label: "Hindi",      nativeName: "हिन्दी"       },
  { code: "es-ES", label: "Spanish",    nativeName: "Español"    },
  { code: "fr-FR", label: "French",     nativeName: "Français"   },
  { code: "de-DE", label: "German",     nativeName: "Deutsch"    },
  { code: "pt-BR", label: "Portuguese", nativeName: "Português"  },
  { code: "ta-IN", label: "Tamil",      nativeName: "தமிழ்"       },
  { code: "bn-IN", label: "Bengali",    nativeName: "বাংলা"       },
  { code: "mr-IN", label: "Marathi",    nativeName: "मराठी"       },
];

export const DEFAULT_LANG = "en-US";

/** Returns true only for a code that is in the SUPPORTED_LANGUAGES list. */
export function isValidLang(code) {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}

/** Returns the English label for a known code, or "English" as a safe fallback. */
export function getLangLabel(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? "English";
}

/**
 * Returns the language instruction block to append to Gemini prompts.
 * Returns an EMPTY STRING for en-US (or any missing/invalid code) so that
 * English prompts are byte-for-byte identical to the pre-language-feature
 * version — no trailing newline, no whitespace added.
 */
export function getLanguageInstruction(code) {
  if (!code || code === DEFAULT_LANG || !isValidLang(code)) return "";
  const label = getLangLabel(code);
  return `\n\nLANGUAGE REQUIREMENT:
Write your entire response in ${label} (${code}).
EXCEPTIONS — keep these exactly in English:
- JSON field names: "Question", "Answer", "Type", "rating", "feedback", "situation", "task", "action", "result", "tips", "improvedAnswer", "followUp"
- The sentinel line format: STAR:S=N,T=N,A=N,R=N (digits only, never translated)
- Ratings and all numbers
- The separator marker: ---\\nFollow-up:
- Bracketed placeholders (such as [add a measurable result here]) must be written in ${label}, still inside square brackets.`;
}

