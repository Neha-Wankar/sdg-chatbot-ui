import { useEffect, useRef, useState } from "react";
import { searchScenarios } from "../../services/scenarioMappingService/scenarioMappingService";
import { processStep } from "../../services/workflowService/workflowService";
import ChatMessage from "../ChatMessage/ChatMessage";
import RequirementInput from "../RequirementInput/RequirementInput";
import "./ChatBot.css";

const suggestions = [
  "Generate synthetic data for donation order processing",
  "Generate 1000 records of synthetic data for order to cash",
  "Create synthetic data for standard sales order processing"
];

const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatBot({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, loading]);

  const addMessage = (message) => setMessages((current) => [...current, { id: id(), ...message }]);

  const sendMessage = async (value = input) => {
    const query = value.trim();
    if (!query || loading) return;
    addMessage({ role: "user", text: query });
    setInput("");
    setLoading(true);
    try {
      addMessage({ role: "bot", text: "I’ll search for the closest approved business scenarios." });
      const response = await searchScenarios(query);
      addMessage({ role: "bot", text: "I found the following matching business scenarios. Please select one:", type: "scenario-results", data: response });
    } catch (error) {
      addMessage({ role: "bot", text: error?.response?.data?.detail || error?.message || "Unable to search scenarios.", error: true });
    } finally { setLoading(false); }
  };

  const selectScenario = (scenario) => {
    const inputStep = scenario.steps?.find((step) => step.requiresInput) || null;
    const state = { scenario, inputStep, values: {} };
    setWorkflow(state);
    addMessage({ role: "user", text: `Selected: ${scenario.name}` });
    addMessage({
      role: "bot",
      text: `Great. You selected ${scenario.name}. Please provide the information required to continue.`
    });

    if (inputStep) {
      addMessage({ role: "bot", text: "Please enter the following details:", type: "business-input-form", data: { step: inputStep, values: {} } });
    } else {
      processBusinessInput(state, {});
    }
  };

  const processBusinessInput = async (state, values) => {
    setLoading(true);
    try {
      if (state.inputStep) {
        await processStep({ scenarioId: state.scenario.id, stepId: state.inputStep.id, inputs: values });
      }
      addMessage({ role: "bot", text: "Your input has been received. I’m processing the scenario configuration before preparing the masking review." });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const nextState = { ...state, values };
      setWorkflow(nextState);
      addMessage({
        role: "bot",
        text: "Review and configure masking data",
      });
    } catch (error) {
      addMessage({ role: "bot", text: error?.response?.data?.detail || error?.message || "The scenario could not be processed.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInput = (values) => {
    if (!workflow || loading) return;
    processBusinessInput(workflow, values);
  };

  return (
    <main className="flex-grow-1 min-width-0 d-flex flex-column bg-body-tertiary">
      <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle login-logo text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>S</div>
          <div><h1 className="h6 mb-1">Synthetic Data Generator</h1><p className="small text-secondary mb-0">Nestle business requirement intelligence</p></div>
        </div>
        <span className="small fw-semibold text-success"><i className="bi bi-circle-fill me-1" style={{ fontSize: 7 }} />Assistant ready</span>
      </header>

      <section className="chat-workspace flex-grow-1 d-flex flex-column min-height-0">
        <div className="chat-messages flex-grow-1">
          <div className="chat-content mx-auto px-2 px-md-4 py-3 py-md-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSelectScenario={selectScenario}
                onBusinessInputSubmit={handleBusinessInput}
                actionLoading={loading}
              />
            ))}
            <div ref={messagesEndRef} aria-hidden="true" className="chat-scroll-anchor" />
            {loading && <div className="d-flex gap-2 align-items-start my-3"><div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">AI</div><div className="bg-white border rounded-3 px-3 py-2 small text-secondary"><span className="spinner-grow spinner-grow-sm me-2" />Processing...</div></div>}
            {messages.length === 1 && !loading && !workflow && <div className="ms-5 mt-4"><p className="small fw-semibold text-secondary">Try asking</p><div className="d-flex flex-wrap gap-2">{suggestions.map((suggestion) => <button className="suggestion-button btn btn-light border text-start small" key={suggestion} onClick={() => sendMessage(suggestion)}><i className="bi bi-arrow-up-right me-2" />{suggestion}</button>)}</div></div>}
          </div>
        </div>
        <div className="chat-composer-area container-fluid px-2 px-md-4">
          <RequirementInput value={input} disabled={loading || Boolean(workflow?.values && Object.keys(workflow.values).length)} onChange={setInput} onSubmit={sendMessage} />
          <div className="text-center small text-secondary my-2">Press Enter to send · Shift + Enter for a new line</div>
          <div className="text-center small text-secondary mb-3">Scenario Mapping Assistant • Use approved business information only.</div>
        </div>
      </section>
    </main>
  );
}
