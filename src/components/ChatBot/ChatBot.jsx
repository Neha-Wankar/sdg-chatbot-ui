import { useEffect, useRef, useState } from "react";
import { searchScenarios } from "../../services/scenarioMappingService/scenarioMappingService";
import { processStep } from "../../services/workflowService/workflowService";
import ChatMessage from "../ChatMessage/ChatMessage";
import RequirementInput from "../RequirementInput/RequirementInput";
import WorkflowSteps from "../WorkflowSteps/WorkflowSteps";
import "./ChatBot.css";

const suggestions = [
  "Generate synthetic data for donation order processing",
  "Generate 1000 records of synthetic data for order to cash",
  "Create synthetic data for standard sales order processing"
];

const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatBot({ messages, setMessages, conversationId }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const latestResponseRef = useRef(null);

  const addMessage = (message) =>
    setMessages((current) => [...current, { id: id(), ...message }]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setWorkflow(null);
    setWorkflowSubmitted(false);
    setInput("");
    setLoading(false);
  }, [conversationId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const sendMessage = async (value = input) => {
    const rawValue = typeof value === "string" ? value : input;
    const query = String(rawValue || "").trim();
    if (!query || loading || workflow) return;

    addMessage({ role: "user", text: query });
    setInput("");
    setLoading(true);

    try {
      addMessage({ role: "bot", text: "I'll search for the closest approved business scenarios." });
      const response = await searchScenarios(query);
      addMessage({
        role: "bot",
        text: "I found the following matching business scenarios. Please select one:",
        type: "scenario-results",
        data: response
      });
    } catch (error) {
      addMessage({
        role: "bot",
        text: error?.response?.data?.detail || error?.message || "Unable to search scenarios.",
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const selectScenario = (scenario) => {
    const steps = Array.isArray(scenario?.steps) ? scenario.steps : [];
    setWorkflowSubmitted(false);
    setWorkflow({ scenario, steps, currentIndex: 0, completed: [], skipped: [], values: {} });
    addMessage({ role: "user", text: `Selected: ${scenario.name}` });
    addMessage({
      role: "bot",
      text: `Great. You selected ${scenario.name}. All workflow steps are shown below. You can click any step to jump to it, or complete them in order. Steps marked "Input Required" must be filled before submitting.`
    });
  };

  const completeStep = async (step, values = {}) => {
    if (!workflow || workflowSubmitted || loading) return;
    const currentStep = workflow.steps[workflow.currentIndex];
    if (!currentStep || currentStep.id !== step.id) return;

    setLoading(true);
    try {
      await processStep({ scenarioId: workflow.scenario.id, stepId: currentStep.id, inputs: values });

      const completed = workflow.completed.includes(currentStep.id)
        ? workflow.completed
        : [...workflow.completed, currentStep.id];

      const skipped = (workflow.skipped || []).filter((id) => id !== currentStep.id);

      let nextIndex = workflow.currentIndex + 1;
      while (nextIndex < workflow.steps.length && completed.includes(workflow.steps[nextIndex]?.id)) {
        nextIndex++;
      }

      setWorkflow({
        ...workflow,
        completed,
        skipped,
        currentIndex: nextIndex,
        values: { ...workflow.values, [currentStep.id]: values },
      });
    } catch (error) {
      addMessage({
        role: "bot",
        text: error?.response?.data?.detail || error?.message || "The current step could not be completed.",
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJumpToStep = async (targetIndex) => {
    if (!workflow || workflowSubmitted || loading) return;

    const stepsToAutoComplete = workflow.steps
      .slice(workflow.currentIndex, targetIndex)
      .filter((s) => !workflow.completed.includes(s.id) && !s.requiresInput);

    setLoading(true);
    try {
      let completed = [...workflow.completed];
      for (const step of stepsToAutoComplete) {
        await processStep({ scenarioId: workflow.scenario.id, stepId: step.id, inputs: {} });
        if (!completed.includes(step.id)) completed = [...completed, step.id];
      }
      const filteredSkipped = (workflow.skipped || []).filter(
        (id) => id !== workflow.steps[targetIndex]?.id
      );
      setWorkflow({ ...workflow, completed, skipped: filteredSkipped, currentIndex: targetIndex });
    } catch (error) {
      addMessage({
        role: "bot",
        text: error?.response?.data?.detail || error?.message || "Could not auto-complete intermediate steps.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepContinue = (step, _index, values = {}) => completeStep(step, values);

  const handleBusinessInputSubmit = (values) => {
    if (!workflow || workflowSubmitted) return;
    const currentStep = workflow.steps[workflow.currentIndex];
    if (!currentStep?.requiresInput) return;
    completeStep(currentStep, values);
  };

  const handleWorkflowSubmit = () => {
    if (workflowSubmitted) return;
    setWorkflowSubmitted(true);
    setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", text: "Your selected workflow steps have been submitted." }]);
  };

  const steps = workflow?.steps || [];
  const currentStepIndex = workflow?.currentIndex ?? 0;
  const completedStepIds = workflow?.completed || [];
  const skippedStepIds = workflow?.skipped || [];

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-[#f0f4f9]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-5 py-3 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-brand-500/30">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-tight">Synthetic Data Generator</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Nestle business requirement intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Assistant ready
        </div>
      </header>

      {/* Chat area */}
      <section className="chat-workspace flex-1 flex flex-col min-h-0">
        <div className="chat-messages flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1000px] w-full mx-auto px-4 md:px-8 py-5 md:py-7">

            {messages.map((message, index) => {
              const isLatest = index === messages.length - 1;
              return (
                <div key={message.id} ref={isLatest ? latestResponseRef : null}>
                  <ChatMessage
                    message={message}
                    onSelectScenario={selectScenario}
                    onBusinessInputSubmit={handleBusinessInputSubmit}
                    actionLoading={loading || workflowSubmitted}
                  />
                </div>
              );
            })}

            {workflow && steps.length > 0 && (
              <div className="ml-12 mt-3">
                <WorkflowSteps
                  steps={steps}
                  currentStepIndex={currentStepIndex}
                  completedStepIds={completedStepIds}
                  skippedStepIds={skippedStepIds}
                  workflowSubmitted={workflowSubmitted}
                  workflowValues={workflow?.values || {}}
                  onStepContinue={handleStepContinue}
                  onJumpToStep={handleJumpToStep}
                  onSubmit={handleWorkflowSubmit}
                  loading={loading}
                />
              </div>
            )}

            {loading && (
              <div className="flex gap-3 items-start my-4" ref={latestResponseRef}>
                <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-brand-500/25">
                  AI
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2.5 shadow-sm">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  Processing…
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && !workflow && (
              <div className="ml-12 mt-5">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="suggestion-chip flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl text-left transition-all hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 hover:shadow-sm active:scale-[0.98] shadow-sm shadow-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-4 md:px-8 pb-4 pt-2">
          <RequirementInput
            value={input}
            disabled={loading || Boolean(workflow)}
            onChange={setInput}
            onSubmit={sendMessage}
          />
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono">Enter</kbd> to send ·{" "}
            <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono">Shift+Enter</kbd> for new line · Use approved business information only.
          </p>
        </div>
      </section>
    </main>
  );
}
