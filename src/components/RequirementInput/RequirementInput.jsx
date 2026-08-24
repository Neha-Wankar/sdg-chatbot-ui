import "./RequirementInput.css";

export default function RequirementInput({ value, disabled, onChange, onSubmit }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="composer mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex gap-2 items-end">
      <textarea
        className="flex-1 min-w-0 resize-none border-0 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 px-2 py-1.5 max-h-40"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your business requirement..."
        rows={1}
      />
      <button
        className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{ background: "rgb(65 116 192)" }}
        disabled={!value.trim() || disabled}
        onClick={onSubmit}
        aria-label="Send"
      >
        {disabled ? (
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="2" /><circle cx="10" cy="10" r="2" /><circle cx="16" cy="10" r="2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
      </button>
    </div>
  );
}
