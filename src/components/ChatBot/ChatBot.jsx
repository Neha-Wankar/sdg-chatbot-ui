import { useEffect, useRef, useState } from "react";
import { CHAT_SUGGESTIONS } from "../../mock/chatSuggestions/chatSuggestions";
import { searchScenarios } from "../../services/scenarioMappingService/scenarioMappingService";
import { processStep } from "../../services/workflowService/workflowService";
import ChatMessage from "../ChatMessage/ChatMessage";
import RequirementInput from "../RequirementInput/RequirementInput";
import WorkflowConfiguration from "../WorkflowConfiguration/WorkflowConfiguration";
import "./ChatBot.css";

const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Conversation phases:
//   "idle"           — waiting for first user message
//   "searching"      — searching scenarios
//   "scenario-select"— waiting for user to select a scenario
//   "cutoff-select"  — waiting for user to select how far to run the test
//   "workflow"       — running the step workflow

export default function ChatBot({
  messages,
  setMessages,
  conversationId,
  // Phase & workflow state are owned by App so they survive conversation switches.
  phase,
  setPhase,
  workflow,
  setWorkflow,
  workflowSubmitted,
  setWorkflowSubmitted,
  sapSelection,
  setSapSelection,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const latestResponseRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Keep track of the previous conversationId so we can distinguish a
  // brand-new conversation (reset needed) from loading an existing one
  // (state already restored by App — do NOT reset).
  const prevConvIdRef = useRef(conversationId);

  const addMessage = (message) =>
    setMessages((current) => [...current, { id: id(), ...message }]);

  useEffect(() => {
    const isNewConversation = prevConvIdRef.current !== conversationId;
    prevConvIdRef.current = conversationId;

    if (!isNewConversation) return;

    // Only reset local UI state (input + loading).
    // Phase, workflow, etc. are already set correctly by App before this
    // effect fires — either to blank (new conv) or to the saved snapshot
    // (loaded conv).
    setInput("");
    setLoading(false);
  }, [conversationId]);

  // Scroll to the latest response during normal conversation.
  // After workflow submission, WorkflowConfiguration owns the scroll.
  useEffect(() => {
    if (workflowSubmitted) return;

    if (latestResponseRef.current) {
      const timer = setTimeout(() => {
        latestResponseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages, workflowSubmitted]);

  // ── Phase 1: User submits their requirement ────────────────────────────────
  const sendMessage = async (value = input) => {
    const rawValue = typeof value === "string" ? value : input;
    const query = String(rawValue || "").trim();
    if (!query || loading || phase !== "idle") return;

    addMessage({ role: "user", text: query });
    setInput("");
    setPhase("searching");
    setLoading(true);

    try {
      addMessage({ role: "bot", text: "I'll search for the closest approved business scenarios for your requirement." });
      const response = await searchScenarios(query);
      setPhase("scenario-select");
      addMessage({
        role: "bot",
        text: "I found the following matching business scenarios. Please select one to proceed:",
        type: "scenario-results",
        data: response,
      });
    } catch (error) {
      setPhase("idle");
      addMessage({
        role: "bot",
        text: error?.response?.data?.detail || error?.message || "Unable to search scenarios.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: User selects a scenario ──────────────────────────────────────
  const selectScenario = (scenario) => {
    if (phase !== "scenario-select") return;

    setPhase("cutoff-select");
    addMessage({ role: "user", text: `Selected scenario: ${scenario.name}` });
    addMessage({
      role: "bot",
      text: "I've identified the following steps for this scenario. Up to which step would you like to perform the test?",
      type: "step-cutoff-selector",
      data: { scenario },
    });
  };

  // ── Phase 4: User picks the cutoff step ───────────────────────────────────
  const handleStepCutoffConfirm = ({ upToIndex, upToStep, selectAll = false }) => {
    if (phase !== "cutoff-select" || loading) return;

    setMessages((current) =>
      current.map((m) =>
        m.type === "step-cutoff-selector" && !m.confirmed
          ? { ...m, confirmed: true }
          : m
      )
    );

    const cutoffMsg = messages.find((m) => m.type === "step-cutoff-selector");
    const scenario = cutoffMsg?.data?.scenario;
    if (!scenario) return;

    const allSteps = Array.isArray(scenario.steps) ? scenario.steps : [];
    const selectedSteps = allSteps.slice(0, upToIndex + 1);

    setSapSelection({ source: null, sourceLandscape: null, target: null, targetLandscape: null });
    setWorkflowSubmitted(false);
    setWorkflow({
      scenario,
      steps: selectedSteps,
      currentIndex: selectedSteps.findIndex((step) => step.requiresInput),
      completed: [],
      skipped: [],
      values: {},
      selectedUpToIndex: upToIndex,
      selectedUpToStep: upToStep,
      selectAllSteps: selectAll,
    });
    setPhase("workflow");

    addMessage({
      role: "user",
      text: `Run test up to Step ${upToIndex + 1}: ${upToStep.name}`,
    });

    addMessage({
      role: "bot",
      text: `All ${selectedSteps.length} step${selectedSteps.length !== 1 ? "s" : ""} are included up to "${upToStep.name}". Please provide the required input and select the SAP systems. Submit the workflow when ready.`,
    });
  };

  // ── Workflow configuration handling ───────────────────────────────────────
  const handleInputChange = (stepId, values) => {
    setWorkflow((current) => {
      if (!current) return current;
      return {
        ...current,
        values: { ...(current.values || {}), [stepId]: values },
      };
    });
  };

  const handleWorkflowSubmit = async () => {
    if (!workflow || workflowSubmitted || loading) return;

    const requiredSteps = workflow.steps.filter((step) => step.requiresInput && !step.fieldsReadOnly);
    const missing = [];

    requiredSteps.forEach((step) => {
      const values = workflow.values?.[step.id] || {};
      (step.fields || []).forEach((field) => {
        if (field.required && !String(values[field.name] || "").trim()) {
          missing.push(`${field.label}`);
        }
      });
    });

    const hasSapSelection = sapSelection.source && sapSelection.sourceLandscape && sapSelection.target && sapSelection.targetLandscape;

    if (missing.length || !hasSapSelection) {
      return;
    }

    setLoading(true);
    try {
      for (const step of workflow.steps) {
        await processStep({
          scenarioId: workflow.scenario.id,
          stepId: step.id,
          inputs: workflow.values?.[step.id] || {},
        });
      }

      setWorkflowSubmitted(true);
      setMessages((prev) => [
        ...prev,
        { id: id(), role: "assistant", text: "Your selected workflow steps have been submitted." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: id(),
          role: "assistant",
          text: error?.response?.data?.detail || error?.message || "The workflow could not be submitted.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const steps = workflow?.steps || [];

  // Business requirement input is disabled while a workflow configuration is open.
  const inputDisabled = loading || Boolean(workflow) || phase === "cutoff-select" || phase === "searching" || phase === "scenario-select";

  return (
    <main className="flex-1 min-w-0 flex flex-col chat-main-bg">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="chat-header shrink-0 flex justify-between items-center px-5 py-3">
        {/* Left: avatar + title */}
        <div className="flex items-center gap-3">
          <div className="ai-header-avatar w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
            {/* Brain / sparkle icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-tight">Synthetic Data Generator</h1>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">Nestlé business requirement intelligence</p>
          </div>
        </div>

        {/* Right: model badge + status pill */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SDG Model
          </div>
          <div className="status-badge flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="hidden sm:inline">
              {loading ? "Processing…" : "Ready"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Chat area ──────────────────────────────────────────────────── */}
      <section className="chat-workspace flex-1 flex flex-col min-h-0">
        <div ref={chatScrollRef} className="chat-messages flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-250 w-full mx-auto px-4 md:px-8 py-5 md:py-7">

            {messages.map((message, index) => {
              const isLatest = index === messages.length - 1;
              return (
                <div key={message.id} ref={isLatest ? latestResponseRef : null}>
                  <ChatMessage
                    message={message}
                    onSelectScenario={selectScenario}
                    onStepCutoffConfirm={handleStepCutoffConfirm}
                    actionLoading={loading || workflowSubmitted}
                  />
                </div>
              );
            })}

            {workflow && steps.length > 0 && (
              <div className="ml-12 mt-3">
                <WorkflowConfiguration
                  steps={steps}
                  workflowValues={workflow.values || {}}
                  sapSelection={sapSelection}
                  onSapSelectionChange={setSapSelection}
                  onInputChange={handleInputChange}
                  onSubmit={handleWorkflowSubmit}
                  loading={loading}
                  submitted={workflowSubmitted}
                />
              </div>
            )}

            {loading && (
              <div className="flex gap-3 items-start my-4" ref={latestResponseRef}>
                <div className="ai-bubble-avatar w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ai-message-bubble px-4 py-3 text-sm text-gray-500 flex items-center gap-2.5">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  Processing…
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && phase === "idle" && (
              <div className="ml-12 mt-5">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {CHAT_SUGGESTIONS.map((suggestion) => (
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

        {/* ── Composer ────────────────────────────────────────────────── */}
        <div className="shrink-0 px-4 md:px-8 pb-5 pt-2">
          <RequirementInput
            value={input}
            disabled={inputDisabled}
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
