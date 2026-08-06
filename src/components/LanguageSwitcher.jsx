import React, { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

// Google's free website-translate widget: it translates the live DOM into
// the selected language, no API key or backend required. This is the
// standard client-side "auto translate page" approach.
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ไทย" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "tl", label: "Filipino" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
];

let scriptLoadStarted = false;

function loadGoogleTranslateScript(onReady) {
  if (window.google?.translate?.TranslateElement) {
    onReady();
    return;
  }
  window.googleTranslateElementInit = () => {
    onReady();
  };
  if (scriptLoadStarted) return;
  scriptLoadStarted = true;
  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function setGoogleTranslateCookie(langCode) {
  // The widget reads/writes the selected language via this cookie.
  const value = langCode === "en" ? "" : `/en/${langCode}`;
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
}

export default function LanguageSwitcher({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    loadGoogleTranslateScript(() => {
      if (containerRef.current && !containerRef.current.hasChildNodes()) {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element_hidden"
        );
      }
      setReady(true);
    });
  }, []);

  const handleSelect = (code) => {
    setGoogleTranslateCookie(code);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden mount point required by the Google Translate widget */}
      <div id="google_translate_element_hidden" ref={containerRef} className="hidden" />

      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center gap-1"
        aria-label="Change language"
        title="Change language"
        disabled={!ready}
      >
        <Languages className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50 py-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
