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
            className={`group w-full text-left border rounded-xl p-3 bg-white transition
              ${selected
                ? "border-2 border-[rgb(65_116_192)] bg-blue-50"
                : "border-gray-200 hover:border-[rgb(65_116_192)] hover:shadow-md hover:-translate-y-px"
              }
              disabled:opacity-70 disabled:cursor-default`}
          >
            <div className="flex gap-3 items-start">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  selected
                    ? "text-white"
                    : "text-[rgb(65_116_192)] bg-blue-100 group-hover:bg-[rgb(65_116_192)] group-hover:text-white"
                }`}
                style={selected ? { background: "rgb(65 116 192)" } : {}}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{parts[0]}</div>
                {parts.slice(1).join(" → ") && (
                  <div className="text-xs text-gray-500 mt-0.5">{parts.slice(1).join(" → ")}</div>
                )}
              </div>
              {selected ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
