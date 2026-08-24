import ScenarioResult from "../ScenarioResult/ScenarioResult";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";

export default function ChatMessage({ message, onSelectScenario, onBusinessInputSubmit, actionLoading }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 my-3 items-start ${isUser ? "justify-end" : ""}`}>
      {/* Bot avatar */}
      {!isUser && (
        <div
          className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "rgb(65 116 192)" }}
        >
          AI
        </div>
      )}

      <div className="flex-1 min-w-0 max-w-[820px]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "text-white ml-auto max-w-fit"
              : message.error
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-white border border-gray-200 text-gray-800 shadow-sm"
          }`}
          style={isUser ? { background: "rgb(65 116 192)" } : {}}
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
        {message.type === "business-input-form" && message.data?.step && (
          <DynamicStepForm
            step={message.data.step}
            initialValues={message.data.values}
            onSubmit={onBusinessInputSubmit}
            loading={actionLoading}
            showStepName={false}
          />
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "rgb(65 116 192)" }}
        >
          You
        </div>
      )}
    </div>
  );
}
