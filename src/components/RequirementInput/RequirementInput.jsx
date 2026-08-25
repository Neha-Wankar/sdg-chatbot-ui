import { useEffect, useRef } from "react";
import "./RequirementInput.css";

const MIN_HEIGHT = 40;   // px — single line
const MAX_HEIGHT = 200;  // px — ~5 lines before scroll kicks in

export default function RequirementInput({ value, disabled, onChange, onSubmit }) {
  const textareaRef = useRef(null);

  // Auto-resize: collapse to 0 first so scrollHeight reflects true content height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="composer mx-auto bg-white border border-gray-200 rounded-2xl shadow-md shadow-gray-200/60 p-2.5 flex gap-2 items-end transition-shadow focus-within:shadow-lg focus-within:shadow-brand-500/8">
      <textarea
        ref={textareaRef}
        className="composer-textarea flex-1 min-w-0 resize-none border-0 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 px-2 py-1.5 leading-relaxed"
        style={{ minHeight: MIN_HEIGHT, overflowY: "hidden" }}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your business requirement…"
        rows={1}
      />
      <button
        className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-all bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-brand-500/30 self-end mb-0"
        disabled={!value.trim() || disabled}
        onClick={() => onSubmit()}
        aria-label="Send"
      >
        {disabled ? (
          <span className="flex gap-0.5 items-center">
            <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
          </span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
      </button>
    </div>
  );
}
