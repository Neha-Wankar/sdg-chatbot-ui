import ScenarioResult from "../ScenarioResult/ScenarioResult";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";

export default function ChatMessage({ message, onSelectScenario, onBusinessInputSubmit, actionLoading }) {
  const isUser = message.role === "user";
  return (
    <div className={`d-flex gap-2 my-3 align-items-start ${isUser ? "justify-content-end" : ""}`}>
      {!isUser && <div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">AI</div>}
      <div className="message-content">
        <div className={`p-3 rounded-3 shadow-sm ${isUser ? "sdg-logo text-white ms-auto" : message.error ? "alert alert-danger mb-0" : "bg-white border"} chat-bubble`}>{message.text}</div>
        {message.type === "scenario-results" && <ScenarioResult scenarios={message.data?.matches || []} selectedId={message.selectedScenarioId} onSelect={onSelectScenario} disabled={actionLoading} />}
        {message.type === "business-input-form" && message.data?.step && <DynamicStepForm step={message.data.step} initialValues={message.data.values} onSubmit={onBusinessInputSubmit} loading={actionLoading} showStepName={false} />}
      </div>
      {isUser && <div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">You</div>}
    </div>
  );
}
