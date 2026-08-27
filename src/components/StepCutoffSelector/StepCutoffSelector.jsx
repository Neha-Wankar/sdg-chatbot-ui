import { useState } from "react";

export default function StepCutoffSelector({ scenario, onConfirm, disabled, confirmed = false }) {
  const steps = scenario?.steps || [];
  const [selectedIndex, setSelectedIndex] = useState(null);

  const canConfirm = selectedIndex !== null;
  const selectedStep = selectedIndex !== null ? steps[selectedIndex] : null;

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">
            Identified Scenario: <span className="text-brand-600">{scenario?.name}</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 ml-8">{confirmed ? "Selected test range is shown below." : "Select up to which step you want to perform the test."}</p>
      </div>

      {/* Steps list */}
      <div className="px-4 py-3 flex flex-col gap-1.5 max-h-72 overflow-y-auto">
        {steps.map((step, index) => {
          const isSelected = selectedIndex === index;
          const isBeforeSelected = selectedIndex !== null && index < selectedIndex;
          const isBeyondSelected = selectedIndex !== null && index > selectedIndex;
          return (
            <button
              key={step.id || index}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedIndex(index)}
              className={`flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? "border-2 border-brand-400 bg-brand-50 shadow-sm"
                  : isBeforeSelected
                  ? "border-brand-200 bg-brand-50/50"
                  : isBeyondSelected
                  ? "border-dashed border-gray-200 bg-gray-50 opacity-50"
                  : "border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/40"
              } disabled:cursor-not-allowed active:scale-[0.99]`}
            >
              {/* Step number */}
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm"
                    : isBeforeSelected
                    ? "bg-brand-500 text-white"
                    : isBeyondSelected
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </span>
              {/* Step name */}
              <span
                className={`flex-1 text-sm font-medium truncate ${
                  isSelected
                    ? "text-brand-700"
                    : isBeforeSelected
                    ? "text-brand-600"
                    : isBeyondSelected
                    ? "text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {step.name}
              </span>
              {/* "Up to here" badge */}
              {isSelected && (
                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200 whitespace-nowrap">
                  Up to here
                </span>
              )}
              {/* included indicator for steps before the cutoff */}
              {isBeforeSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {/* radio indicator */}
              {!isSelected && !isBeforeSelected && !isBeyondSelected && (
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3">
        <div className="text-xs">
          {selectedStep ? (
            <span className="text-brand-700 font-semibold">
              Up to Step {selectedIndex + 1}: {selectedStep.name}
            </span>
          ) : (
            <span className="text-gray-400">No step selected yet.</span>
          )}
        </div>
        {!confirmed ? (
          <button
            type="button"
            disabled={!canConfirm || disabled}
            onClick={() => onConfirm({ upToIndex: selectedIndex, upToStep: selectedStep })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm shadow-brand-500/25 transition-all"
          >
            Start Test
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Test range selected
          </span>
        )}
      </div>
    </div>
  );
}
