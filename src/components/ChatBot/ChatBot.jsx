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
   const maskingRef = useRef(null);

   const addMessage = (message) =>
      setMessages((current) => [...current, { id: id(), ...message }]);

   // Reset ChatBot-local state whenever the parent starts a new conversation.
   // The workflow is local to ChatBot, so resetting only App messages is not enough.
   useEffect(() => {
      setWorkflow(null);
      setWorkflowSubmitted(false);
      setInput("");
      setLoading(false);
   }, [conversationId]);

   // useEffect(() => {
   //    const frame = requestAnimationFrame(() => {
   //       latestResponseRef.current?.scrollIntoView({
   //          behavior: "smooth",
   //          block: "center"
   //       });
   //    });
   //    return () => cancelAnimationFrame(frame);
   // }, [messages, loading, workflow?.currentIndex, workflowSubmitted]);

   // useEffect(() => {
   //    requestAnimationFrame(() => {
   //       latestResponseRef.current?.scrollIntoView({
   //          behavior: "smooth",
   //          block: "center",
   //       });
   //    });
   // }, [messages, loading]);

   const sendMessage = async (value = input) => {
      const query = String(value || "").trim();
      if (!query || loading || workflow) return;

      addMessage({ role: "user", text: query });
      setInput("");
      setLoading(true);

      try {
         addMessage({
            role: "bot",
            text: "I’ll search for the closest approved business scenarios."
         });
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
            text:
               error?.response?.data?.detail ||
               error?.message ||
               "Unable to search scenarios.",
            error: true
         });
      } finally {
         setLoading(false);
      }
   };

   const selectScenario = (scenario) => {
      const steps = Array.isArray(scenario?.steps) ? scenario.steps : [];

      setWorkflowSubmitted(false);
      setWorkflow({
         scenario,
         steps,
         currentIndex: 0,
         completed: [],
         values: {}
      });

      addMessage({
         role: "user",
         text: `Selected: ${scenario.name}`
      });
      addMessage({
         role: "bot",
         text:
            `Great. You selected ${scenario.name}. ` +
            "All workflow steps are shown below. Please complete them sequentially. " +
            "You can submit at any point."
      });
   };

   const completeStep = async (step, values = {}) => {
      if (!workflow || workflowSubmitted || loading) return;

      const currentStep = workflow.steps[workflow.currentIndex];
      if (!currentStep || currentStep.id !== step.id) return;

      setLoading(true);
      try {
         await processStep({
            scenarioId: workflow.scenario.id,
            stepId: currentStep.id,
            inputs: values
         });

         if (step.requiresInput) {
            setWorkflow((previous) => ({
               ...previous,
               values: {
                  ...(previous?.values || {}),
                  [step.id]: values,
               },
            }));
         }

         const completed = workflow.completed.includes(currentStep.id)
            ? workflow.completed
            : [...workflow.completed, currentStep.id];

         const nextIndex = workflow.currentIndex + 1;

         setWorkflow({
            ...workflow,
            completed,
            currentIndex: nextIndex,
            values: { ...workflow.values, [currentStep.id]: values }
         });

         // addMessage({
         //    role: "bot",
         //    text: `Step ${workflow.currentIndex + 1} completed: ${currentStep.name}`
         // });

         // if (nextIndex < workflow.steps.length) {
         //    addMessage({
         //       role: "bot",
         //       text: `Step ${nextIndex + 1} is now active: ${workflow.steps[nextIndex].name}`
         //    });
         // }
      } catch (error) {
         addMessage({
            role: "bot",
            text:
               error?.response?.data?.detail ||
               error?.message ||
               "The current step could not be completed.",
            error: true
         });
      } finally {
         setLoading(false);
      }
   };

   const handleStepContinue = (step) => {
      completeStep(step, {});
   };

   const handleBusinessInputSubmit = (values) => {
      if (!workflow || workflowSubmitted) return;
      const currentStep = workflow.steps[workflow.currentIndex];
      if (!currentStep?.requiresInput) return;
      completeStep(currentStep, values);
   };

   const handleWorkflowSubmit = () => {
      if (workflowSubmitted) return;

      setWorkflowSubmitted(true);

      setMessages((prev) => [
         ...prev,
         {
            id: Date.now(),
            role: "assistant",
            text: "Your selected workflow steps have been submitted.",
         },
      ]);

      // requestAnimationFrame(() => {
      //    setTimeout(() => {
      //       maskingRef.current?.scrollIntoView({
      //          behavior: "smooth",
      //          block: "center",
      //       });
      //    }, 150);
      // });
   };

   const handleNewConversation = () => {
      // Reset the conversation back to the initial chatbot state.
      setMessages([
         {
            id: id(),
            role: "bot",
            text: "Hi, I am bot. Please enter your business requirement."
         }
      ]);

      // The uploaded codebase keeps scenario/workflow state inside `workflow`.
      // Resetting it removes the Process Steps section and scenario selection.
      setWorkflow(null);
      setWorkflowSubmitted(false);

      setInput("");
      setLoading(false);
   };

   // These are intentionally derived from workflow state so they always exist
   // before JSX rendering. No global/undefined `steps` variables are used.
   const steps = workflow?.steps || [];
   const currentStepIndex = workflow?.currentIndex ?? 0;
   const completedStepIds = workflow?.completed || [];
   const currentStep = steps[currentStepIndex];

   return (
      <main className="flex-grow-1 min-width-0 d-flex flex-column bg-body-tertiary">
         <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
               <div className="rounded-circle login-logo text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>S</div>
               <div>
                  <h1 className="h6 mb-1">Synthetic Data Generator</h1>
                  <p className="small text-secondary mb-0">Nestle business requirement intelligence</p>
               </div>
            </div>
            <span className="small fw-semibold text-success">
               <i className="bi bi-circle-fill me-1" style={{ fontSize: 7 }} />Assistant ready
            </span>
         </header>

         <section className="chat-workspace flex-grow-1 d-flex flex-column min-height-0">
            <div className="chat-messages flex-grow-1">
               <div className="chat-content mx-auto px-2 px-md-4 py-3 py-md-4">
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
                     <div className="ms-5 mt-3">
                        <WorkflowSteps
                           steps={steps}
                           currentStepIndex={currentStepIndex}
                           completedStepIds={completedStepIds}
                           workflowSubmitted={workflowSubmitted}
                           workflowValues={workflow?.values || {}}
                           onStepContinue={handleStepContinue}
                           onSubmit={handleWorkflowSubmit}
                           loading={loading}
                        />
                     </div>
                  )}
                  {loading && (
                     <div className="d-flex gap-2 align-items-start my-3" ref={latestResponseRef}>
                        <div className="message-avatar rounded-3 sdg-logo text-white d-flex align-items-center justify-content-center small fw-bold">AI</div>
                        <div className="bg-white border rounded-3 px-3 py-2 small text-secondary">
                           <span className="spinner-grow spinner-grow-sm me-2" />Processing...
                        </div>
                     </div>
                  )}

                  {messages.length === 1 && !loading && !workflow && (
                     <div className="ms-5 mt-4">
                        <p className="small fw-semibold text-secondary">Try asking</p>
                        <div className="d-flex flex-wrap gap-2">
                           {suggestions.map((suggestion) => (
                              <button
                                 className="suggestion-button btn btn-light border text-start small"
                                 key={suggestion}
                                 onClick={() => sendMessage(suggestion)}
                              >
                                 <i className="bi bi-arrow-up-right me-2" />{suggestion}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className="chat-composer-area container-fluid px-2 px-md-4">
               <RequirementInput
                  value={input}
                  disabled={loading || Boolean(workflow)}
                  onChange={setInput}
                  onSubmit={sendMessage}
               />
               <div className="text-center small text-secondary my-2">Press Enter to send · Shift + Enter for a new line</div>
               <div className="text-center small text-secondary mb-3">Scenario Mapping Assistant • Use approved business information only.</div>
            </div>
         </section>
      </main>
   );
}
