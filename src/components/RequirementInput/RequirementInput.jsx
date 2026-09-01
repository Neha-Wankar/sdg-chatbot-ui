import { useEffect, useRef } from "react";
import "./RequirementInput.css";

const MIN_HEIGHT = 42;   // px — single line
const MAX_HEIGHT = 200;  // px — ~5 lines before scroll kicks in

export default function RequirementInput({ value, disabled, onChange, onSubmit }) {
  const textareaRef = useRef(null);

  // Auto-resize: collapse to 0 first so scrollHeight reflects true content height.
  // When value is empty (after submit) snap height back instantly without transition.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (!value) {
      el.style.transition = "none";
      el.style.height = `${MIN_HEIGHT}px`;
      el.style.overflowY = "hidden";
      requestAnimationFrame(() => {
        el.style.transition = "";
      });
      return;
    }

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

  const canSend = value.trim() && !disabled;

  return (
    <div className="composer mx-auto">
      {/* Top row: textarea */}
      <textarea
        ref={textareaRef}
        className="composer-textarea w-full resize-none border-0 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 px-4 pt-3 pb-1 leading-relaxed"
        style={{ minHeight: MIN_HEIGHT, overflowY: "hidden" }}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your business requirement…"
        rows={1}
      />

      {/* Bottom bar: char hint + send button */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
        {/* Left hint */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            <span className="font-mono text-[10px]">Enter</span>
          </div>
          <span>to send</span>
          {disabled && !value && (
            <span className="text-amber-500 font-medium ml-1">· Input locked during workflow</span>
          )}
        </div>

        {/* Send button */}
        <button
          className={`composer-send w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 ${
            canSend
              ? "send-active shadow-md"
              : "send-inactive cursor-not-allowed"
          }`}
          disabled={!canSend}
          onClick={() => onSubmit()}
          aria-label="Send message"
        >
          {disabled && value ? (
            <span className="flex gap-0.5 items-center">
              <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
