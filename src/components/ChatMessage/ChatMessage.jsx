import ScenarioResult from "../ScenarioResult/ScenarioResult";
import WorkflowSteps from "../WorkflowSteps/WorkflowSteps";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";

export default function ChatMessage({ message, onSelectScenario, onStepContinue, onStepSubmit, actionLoading }) {
  const isUser = message.role === "user";
  return (
    <div className={`d-flex gap-2 my-3 align-items-start ${isUser ? "justify-content-end" : ""}`}>
      {!isUser && <div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">AI</div>}
      <div className="message-content">
        <div className={`p-3 rounded-3 shadow-sm ${isUser ? "sdg-logo text-white ms-auto" : message.error ? "alert alert-danger mb-0" : "bg-white border"} chat-bubble`}>{message.text}</div>
        {message.type === "scenario-results" && <ScenarioResult scenarios={message.data?.matches || []} selectedId={message.selectedScenarioId} onSelect={onSelectScenario} disabled={actionLoading} />}
        {message.type === "workflow-steps" && <WorkflowSteps steps={message.data?.steps || []} currentIndex={message.currentIndex || 0} completed={message.completed || []} />}
        {message.type === "step-form" && message.data?.step && <DynamicStepForm step={message.data.step} initialValues={message.data.values} onSubmit={onStepSubmit} loading={actionLoading} />}
        {message.type === "step-complete" && <div className="alert alert-success py-2 small mt-3 mb-0"><i className="bi bi-check-circle me-2" />{message.data?.message}</div>}
        {message.type === "continue-step" && <button className="btn step-primary mt-3" onClick={onStepContinue} disabled={actionLoading}>Continue <i className="bi bi-arrow-right ms-2" /></button>}
      </div>
      {isUser && <div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">You</div>}
    </div>
  );
}
