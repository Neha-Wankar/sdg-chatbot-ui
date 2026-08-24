import { useEffect, useRef, useState } from "react";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";
import MaskingDataTable from "../MaskingDataTable/MaskingDataTable";

// ─── Blocked-by-Input Modal ───────────────────────────────────────────────────
// Input-required steps are mandatory — user cannot jump past them.
function BlockedModal({ blockedSteps, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">Cannot Skip — Input Required</div>
            <div className="text-xs text-gray-500 mt-0.5">
              The following steps have mandatory input fields. You must complete them before proceeding.
            </div>
          </div>
        </div>

        {/* Blocked steps list */}
        <div className="px-5 py-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Required steps you must complete first:
          </div>
          <ul className="flex flex-col gap-2">
            {blockedSteps.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50"
              >
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {step.displayIndex}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{step.name}</div>
                  <div className="text-xs text-red-500 mt-0.5">{step.fields?.length || 0} field{(step.fields?.length || 0) !== 1 ? "s" : ""} to fill</div>
                </div>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Mandatory
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            Please complete these steps in order. Input fields are required and cannot be skipped.
          </p>
        </div>

        {/* Actions — only Go Back, no way to bypass */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "rgb(65 116 192)" }}
          >
            Got it, go back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Status Icon ─────────────────────────────────────────────────────────
function StepIcon({ index, isCompleted, isActive, isSkipped }) {
  if (isCompleted) {
    return (
      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white bg-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (isSkipped) {
    return (
      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gray-400">
        {index + 1}
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white"
      style={{ background: isActive ? "rgb(65 116 192)" : "rgb(156 163 175)" }}
    >
      {index + 1}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkflowSteps({
  steps = [],
  currentStepIndex = 0,
  completedStepIds = [],
  skippedStepIds = [],
  workflowSubmitted = false,
  workflowValues = {},
  onStepContinue,
  onJumpToStep,
  onSubmit,
  loading = false,
}) {
  const completed = new Set(completedStepIds);
  const skipped = new Set(skippedStepIds);
  const activeStepRef = useRef(null);
  const dataSourceRef = useRef(null);
  const [blockedSteps, setBlockedSteps] = useState([]);
  const [dataSource, setDataSource] = useState("sap");

  // Scroll to "Choose data source" once when the component mounts (scenario selected)
  useEffect(() => {
    const timer = setTimeout(() => {
      dataSourceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (workflowSubmitted) return;
    const timer = setTimeout(() => {
      activeStepRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex, workflowSubmitted]);

  // Handle clicking a step to jump to it.
  // Rules:
  //   - If any step between current and target has requiresInput and is not completed → BLOCK, show modal.
  //   - Otherwise → auto-complete all non-input steps in between and jump.
  const handleStepClick = (clickedIndex) => {
    if (workflowSubmitted || loading) return;
    if (clickedIndex === currentStepIndex) return;
    if (completed.has(steps[clickedIndex]?.id)) return;

    // Only check forward jumps for blocking; backward jumps (going back to a skipped step) always allowed
    if (clickedIndex > currentStepIndex) {
      const stepsInBetween = steps
        .slice(currentStepIndex, clickedIndex)
        .map((s, relIdx) => ({ ...s, displayIndex: currentStepIndex + relIdx + 1 }))
        .filter((s) => !completed.has(s.id));

      const mandatoryBlocked = stepsInBetween.filter((s) => s.requiresInput);

      if (mandatoryBlocked.length > 0) {
        // Hard block — show modal, no bypass
        setBlockedSteps(mandatoryBlocked);
        return;
      }
    }

    // No blockers — jump (ChatBot will auto-complete non-input steps in between)
    onJumpToStep?.(clickedIndex);
  };

  const handleBlockedClose = () => setBlockedSteps([]);

  const pendingInputCount = steps.filter(
    (s) => s.requiresInput && !completed.has(s.id)
  ).length;

  return (
    <div className="mt-4">
      {/* Blocked modal */}
      {blockedSteps.length > 0 && (
        <BlockedModal
          blockedSteps={blockedSteps}
          onClose={handleBlockedClose}
        />
      )}

      {/* Choose data source */}
      <div ref={dataSourceRef} className="mb-4 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3">
        <div className="text-sm font-semibold text-gray-800 mb-3">Choose data source</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer">
            <input
              type="radio"
              name="dataSource"
              value="sap"
              checked={dataSource === "sap"}
              onChange={() => setDataSource("sap")}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800">Pull data from SAP</span>
          </label>
          <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer">
            <input
              type="radio"
              name="dataSource"
              value="datalake"
              checked={dataSource === "datalake"}
              onChange={() => setDataSource("datalake")}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800">Pull data from Datalake</span>
          </label>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900 text-sm">Process Steps</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Click any step to jump to it. Steps with{" "}
            <span className="font-semibold" style={{ color: "rgb(65 116 192)" }}>Input Required</span>{" "}
            must be filled before submitting.
          </div>
        </div>
        {!workflowSubmitted && pendingInputCount > 0 && (
          <div
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full"
            style={{ background: "rgb(65 116 192 / 0.1)", color: "rgb(65 116 192)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {pendingInputCount} input{pendingInputCount !== 1 ? "s" : ""} pending
          </div>
        )}
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-2.5">
        {steps.map((step, index) => {
          const isCompleted = completed.has(step.id);
          const isSkippedOver = skipped.has(step.id);
          const isActive = !workflowSubmitted && !isCompleted && index === currentStepIndex;
          const isFuture = !workflowSubmitted && !isCompleted && !isSkippedOver && index > currentStepIndex;
          const isClickable = !workflowSubmitted && !isCompleted && !loading;

          let cardClass = "w-full flex items-start gap-3 p-4 border rounded-xl transition ";
          let cardStyle = {};

          if (isCompleted) {
            cardClass += "border-emerald-200 bg-emerald-50";
          } else if (isActive) {
            cardClass += "border-2 bg-blue-50 shadow-sm";
            cardStyle = { borderColor: "rgb(65 116 192)" };
          } else if (isSkippedOver) {
            cardClass += "border-dashed border-amber-300 bg-amber-50/50";
          } else {
            cardClass += "border-gray-200 bg-white";
            if (isFuture) cardClass += " opacity-60";
          }

          if (isClickable && !isActive) {
            cardClass += " cursor-pointer hover:shadow-sm";
          }

          return (
            <div
              key={step.id || index}
              ref={isActive ? activeStepRef : null}
              className={cardClass}
              style={cardStyle}
              onClick={() => isClickable && !isActive && handleStepClick(index)}
              role={isClickable && !isActive ? "button" : undefined}
              tabIndex={isClickable && !isActive ? 0 : undefined}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && isClickable && !isActive) {
                  e.preventDefault();
                  handleStepClick(index);
                }
              }}
            >
              {/* Step icon */}
              <StepIcon
                index={index}
                isCompleted={isCompleted}
                isActive={isActive}
                isSkipped={isSkippedOver}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#172b4d]">{step.name}</div>

                {/* Status line */}
                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </div>
                )}

                {isSkippedOver && !isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Skipped — click to complete
                  </div>
                )}

                {isFuture && !isSkippedOver && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending — click to jump here
                  </div>
                )}

                {/* Active — no input */}
                {isActive && !step.requiresInput && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Please continue with this step.</p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => { e.stopPropagation(); onStepContinue(step, index); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white font-medium transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: "rgb(65 116 192)" }}
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Active — input required */}
                {isActive && step.requiresInput && (
                  <div className="mt-3 pt-3 border-t border-blue-200" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-gray-500 mb-3">Please provide the information required for this step.</p>
                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      disabled={loading}
                      onSubmit={(values) => onStepContinue(step, index, values)}
                    />
                  </div>
                )}

                {/* Completed with input — show read-only summary */}
                {isCompleted && step.requiresInput && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="flex items-center gap-1.5 text-xs text-emerald-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Input submitted for this step
                    </p>
                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      readOnly={true}
                      onSubmit={() => {}}
                    />
                  </div>
                )}
              </div>

              {/* Right-side badges / icons */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                {/* Input required badge — always visible for input steps not yet completed */}
                {step.requiresInput && !isCompleted && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgb(65 116 192 / 0.12)", color: "rgb(65 116 192)" }}
                  >
                    Input required
                  </span>
                )}

                {/* Jump hint for non-active, non-completed clickable steps */}
                {isClickable && !isActive && !isCompleted && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!workflowSubmitted && steps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{completedStepIds.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{steps.length}</span> steps completed
              {pendingInputCount > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  · {pendingInputCount} input{pendingInputCount !== 1 ? "s" : ""} still pending
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={completedStepIds.length === 0 || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "rgb(65 116 192)" }}
            >
              Submit
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Submitted state */}
      {workflowSubmitted && (
        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Workflow submitted successfully. You can now review and configure the masking data.
          </div>
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Review and configure masking data
          </div>
          <MaskingDataTable />
        </div>
      )}
    </div>
  );
}
