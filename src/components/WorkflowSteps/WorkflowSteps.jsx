import React, { useEffect, useRef } from "react";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";

export default function WorkflowSteps({
  steps = [],
  currentStepIndex = 0,
  completedStepIds = [],
  workflowSubmitted = false,
  workflowValues = {},
  onStepContinue,
  onSubmit,
}) {
  const completed = new Set(completedStepIds);
  const activeStepRef = useRef(null);

  useEffect(() => {
    if (workflowSubmitted) return;
    const timer = setTimeout(() => {
      activeStepRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="mb-4">
        <div className="font-semibold text-gray-900 text-sm">Process Steps</div>
        <div className="text-xs text-gray-500 mt-0.5">Complete the steps sequentially. You can submit at any point.</div>
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-2.5">
        {steps.map((step, index) => {
          const isCompleted = completed.has(step.id);
          const isCurrent = !workflowSubmitted && !isCompleted && index === currentStepIndex;
          const isFuture = !workflowSubmitted && !isCompleted && index > currentStepIndex;

          return (
            <div
              key={step.id || index}
              ref={isCurrent ? activeStepRef : null}
              className={`w-full flex items-start gap-3 p-4 border rounded-xl transition ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50"
                  : isCurrent
                  ? "border-2 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white opacity-55"
              }`}
              style={isCurrent ? { borderColor: "rgb(65 116 192)" } : {}}
            >
              {/* Step number */}
              <div
                className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                  isCompleted ? "bg-emerald-500" : ""
                }`}
                style={!isCompleted ? { background: "rgb(65 116 192)" } : {}}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#172b4d]">{step.name}</div>

                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </div>
                )}

                {isFuture && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Complete the previous step first
                  </div>
                )}

                {/* Current — no input required */}
                {isCurrent && !step.requiresInput && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Please continue with this step.</p>
                    <button
                      type="button"
                      onClick={() => onStepContinue(step, index)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white font-medium transition hover:opacity-90"
                      style={{ background: "rgb(65 116 192)" }}
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Current — input required */}
                {isCurrent && step.requiresInput && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-500 mb-3">Please provide the information required for this step.</p>
                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      disabled={false}
                      onSubmit={(values) => onStepContinue(step, index, values)}
                    />
                  </div>
                )}

                {/* Completed with input */}
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

              {/* Badge — input required */}
              {isCurrent && step.requiresInput && (
                <span
                  className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgb(65 116 192 / 0.12)", color: "rgb(65 116 192)" }}
                >
                  Input required
                </span>
              )}

              {/* Lock icon for future */}
              {isFuture && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!workflowSubmitted && steps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-2">Do you want to submit the process steps?</p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={completedStepIds.length === 0}
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
        </div>
      )}
    </div>
  );
}
