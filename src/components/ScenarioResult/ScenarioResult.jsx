export default function ScenarioResult({ scenarios = [], selectedId, onSelect, disabled }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {scenarios.map((scenario, index) => {
        const selected = selectedId === scenario.id;
        const parts = scenario.name.split(" > ");

        return (
          <button
            type="button"
            key={scenario.id}
            disabled={disabled}
            onClick={() => onSelect?.(scenario)}
            className={`group w-full text-left rounded-xl p-3.5 transition-all ${
              selected
                ? "border-2 border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10"
                : "border border-gray-200 bg-white hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/8 hover:-translate-y-px"
            } disabled:opacity-70 disabled:cursor-default active:scale-[0.99]`}
          >
            <div className="flex gap-3 items-center">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  selected
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-brand-500 bg-brand-50 group-hover:bg-brand-500 group-hover:text-white"
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 leading-snug">{parts[0]}</div>
                {parts.slice(1).join(" → ") && (
                  <div className="text-xs text-gray-500 mt-0.5">{parts.slice(1).join(" → ")}</div>
                )}
              </div>
              {selected ? (
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
