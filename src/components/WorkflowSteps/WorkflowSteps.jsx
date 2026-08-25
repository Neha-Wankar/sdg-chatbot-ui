import { useEffect, useRef, useState } from "react";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";
import MaskingDataTable from "../MaskingDataTable/MaskingDataTable";

// ─── Blocked-by-Input Modal ───────────────────────────────────────────────────
function BlockedModal({ blockedSteps, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-red-50/60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
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
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
            Steps to complete first:
          </div>
          <ul className="flex flex-col gap-2">
            {blockedSteps.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-red-200 bg-red-50/60"
              >
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {step.displayIndex}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{step.name}</div>
                  <div className="text-xs text-red-500 mt-0.5">{step.fields?.length || 0} field{(step.fields?.length || 0) !== 1 ? "s" : ""} to fill</div>
                </div>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Required
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Complete these steps in order — input fields cannot be skipped.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] shadow-sm shadow-brand-500/25"
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
      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white bg-emerald-500 shadow-sm shadow-emerald-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (isSkipped) {
    return (
      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gray-400/80">
        {index + 1}
      </div>
    );
  }
  if (isActive) {
    return (
      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white bg-brand-500 shadow-md shadow-brand-500/35 ring-4 ring-brand-500/15">
        {index + 1}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-gray-400 bg-gray-100 border-2 border-gray-200">
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

  const handleStepClick = (clickedIndex) => {
    if (workflowSubmitted || loading) return;
    if (clickedIndex === currentStepIndex) return;
    if (completed.has(steps[clickedIndex]?.id)) return;

    if (clickedIndex > currentStepIndex) {
      const stepsInBetween = steps
        .slice(currentStepIndex, clickedIndex)
        .map((s, relIdx) => ({ ...s, displayIndex: currentStepIndex + relIdx + 1 }))
        .filter((s) => !completed.has(s.id));

      const mandatoryBlocked = stepsInBetween.filter((s) => s.requiresInput);

      if (mandatoryBlocked.length > 0) {
        setBlockedSteps(mandatoryBlocked);
        return;
      }
    }

    onJumpToStep?.(clickedIndex);
  };

  const handleBlockedClose = () => setBlockedSteps([]);

  const pendingInputCount = steps.filter(
    (s) => s.requiresInput && !completed.has(s.id)
  ).length;

  return (
    <div className="mt-4 space-y-3">
      {/* Blocked modal */}
      {blockedSteps.length > 0 && (
        <BlockedModal blockedSteps={blockedSteps} onClose={handleBlockedClose} />
      )}

      {/* Choose data source */}
      <div ref={dataSourceRef} className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-gray-900">Choose data source</div>
        </div>
        {(() => {
          const DATA_SOURCE_OPTIONS = [
            { value: "sap", label: "Pull from SAP", icon: "🗄️" },
            { value: "datalake", label: "Pull from Datalake", icon: "☁️" },
          ];
          const selected = DATA_SOURCE_OPTIONS.find((o) => o.value === dataSource);
          return (
            <>
              <div className="grid grid-cols-2 gap-2">
                {DATA_SOURCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      dataSource === opt.value
                        ? "border-brand-400 bg-brand-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dataSource"
                      value={opt.value}
                      checked={dataSource === opt.value}
                      onChange={() => setDataSource(opt.value)}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className={`text-sm font-medium ${dataSource === opt.value ? "text-brand-700" : "text-gray-700"}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {selected && (
                <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Selected: <span className="font-semibold">{selected.label}</span></span>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <div className="font-bold text-gray-900 text-sm tracking-tight">Process Steps</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Click any step to jump to it. Steps with{" "}
            <span className="font-semibold text-brand-500">Input Required</span>{" "}
            must be filled before submitting.
          </div>
        </div>
        {!workflowSubmitted && pendingInputCount > 0 && (
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {pendingInputCount} input{pendingInputCount !== 1 ? "s" : ""} pending
          </div>
        )}
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-2">
        {steps.map((step, index) => {
          const isCompleted = completed.has(step.id);
          const isSkippedOver = skipped.has(step.id);
          const isActive = !workflowSubmitted && !isCompleted && index === currentStepIndex;
          const isFuture = !workflowSubmitted && !isCompleted && !isSkippedOver && index > currentStepIndex;
          const isClickable = !workflowSubmitted && !isCompleted && !loading;

          let cardClass = "w-full flex items-start gap-3.5 p-4 border rounded-2xl transition-all ";

          if (isCompleted) {
            cardClass += "border-emerald-200 bg-emerald-50/60";
          } else if (isActive) {
            cardClass += "border-2 border-brand-400 bg-white shadow-md shadow-brand-500/8";
          } else if (isSkippedOver) {
            cardClass += "border-dashed border-amber-300 bg-amber-50/40";
          } else {
            cardClass += "border-gray-200 bg-white";
            if (isFuture) cardClass += " opacity-55";
          }

          if (isClickable && !isActive) {
            cardClass += " cursor-pointer hover:shadow-sm hover:border-gray-300";
          }

          return (
            <div
              key={step.id || index}
              ref={isActive ? activeStepRef : null}
              className={cardClass}
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
              <div className="mt-0.5">
                <StepIcon
                  index={index}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  isSkipped={isSkippedOver}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 leading-snug">{step.name}</div>

                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </div>
                )}

                {isSkippedOver && !isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1 font-medium">
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
                    <p className="text-xs text-gray-500 mb-2.5">Please continue with this step.</p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => { e.stopPropagation(); onStepContinue(step, index); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-brand-500/25"
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Active — input required */}
                {isActive && step.requiresInput && (
                  <div className="mt-3 pt-3 border-t border-brand-200/60" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-gray-500 mb-3">Please provide the information required for this step.</p>
                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      disabled={loading}
                      onSubmit={(values) => onStepContinue(step, index, values)}
                    />
                  </div>
                )}

                {/* Completed with input — read-only summary */}
                {isCompleted && step.requiresInput && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60">
                    <p className="flex items-center gap-1.5 text-xs text-emerald-600 mb-3 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Input submitted
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

              {/* Right-side badges */}
              <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
                {step.requiresInput && !isCompleted && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 whitespace-nowrap">
                    Input required
                  </span>
                )}
                {isClickable && !isActive && !isCompleted && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              <span className="font-bold text-gray-700">{completedStepIds.length}</span> of{" "}
              <span className="font-bold text-gray-700">{steps.length}</span> steps completed
              {pendingInputCount > 0 && (
                <span className="ml-2 text-amber-600 font-semibold">
                  · {pendingInputCount} input{pendingInputCount !== 1 ? "s" : ""} pending
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={completedStepIds.length === 0 || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
            >
              Submit workflow
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Submitted state */}
      {workflowSubmitted && (
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-emerald-800">Workflow submitted successfully</div>
              <div className="text-xs text-emerald-600 mt-0.5">You can now review and configure the masking data below.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-brand-200 bg-brand-50 text-sm text-brand-700 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-brand-800">Review masking configuration</div>
              <div className="text-xs text-brand-600 mt-0.5">Configure data masking before generating synthetic records.</div>
            </div>
          </div>
          <MaskingDataTable />
        </div>
      )}
    </div>
  );
}
