import ScenarioResult from "../ScenarioResult/ScenarioResult";
import StepCutoffSelector from "../StepCutoffSelector/StepCutoffSelector";
import "./ChatMessage.css";

export default function ChatMessage({
  message,
  onSelectScenario,
  onStepCutoffConfirm,
  actionLoading,
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 my-4 items-start ${isUser ? "justify-end" : ""}`}>
      {/* ── Bot avatar ─────────────────────────────────────────── */}
      {!isUser && (
        <div className="ai-msg-avatar w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0 max-w-[820px]">
        {/* ── Sender label ───────────────────────────────────── */}
        <div className={`text-[10px] font-bold mb-1 tracking-wide uppercase ${isUser ? "text-right text-brand-500/70 mr-1" : "text-gray-400 ml-1"}`}>
          {isUser ? "You" : "SDG Assistant"}
        </div>

        {/* ── Message bubble ─────────────────────────────────── */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "user-bubble text-white ml-auto max-w-fit"
              : message.error
              ? "bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-tl-sm shadow-sm"
              : "ai-bubble text-gray-800"
          }`}
        >
          {message.text}
        </div>

        {message.type === "scenario-results" && (
          <ScenarioResult
            scenarios={message.data?.matches || []}
            selectedId={message.selectedScenarioId}
            onSelect={onSelectScenario}
            disabled={actionLoading}
          />
        )}

        {message.type === "step-cutoff-selector" && (
          <StepCutoffSelector
            scenario={message.data?.scenario}
            onConfirm={onStepCutoffConfirm}
            disabled={actionLoading || message.confirmed}
            confirmed={message.confirmed}
          />
        )}
      </div>

      {/* ── User avatar ────────────────────────────────────────── */}
      {isUser && (
        <div className="you-msg-avatar w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
