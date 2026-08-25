import DataSources from "../DataSources/DataSources";
import ExecutionPath from "../ExecutionPath/ExecutionPath";

function ActionButton({ children, onClick, loading }) {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed min-w-[210px] shadow-sm shadow-brand-500/20"
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Processing…
        </>
      ) : children}
    </button>
  );
}

export default function WorkflowCard({ type, data, onContinue, loading }) {

  if (type === "scenario") {
    const confidence = Math.round((data?.scenario?.confidence || 0) * 100);
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">01 · Describe scenario</div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-gray-500">Identified:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700">
              {data?.scenario?.name}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            NLP confidence: <strong className="text-gray-800 font-semibold">{confidence}%</strong>
          </div>
          <div className="flex items-center gap-2 mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            ART template available — data will be pushed to ART.
          </div>
          <div className="mt-4">
            <DataSources sources={data?.dataSources || []} />
            <ExecutionPath execution={data?.execution || {}} />
          </div>
        </div>
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex flex-wrap gap-2">
          <ActionButton onClick={() => onContinue?.("scenario")} loading={loading}>Identify scenario</ActionButton>
          <ActionButton onClick={() => onContinue?.("scenarioNlp")} loading={loading}>Identify scenario with NLP</ActionButton>
        </div>
      </div>
    );
  }

  if (type === "steps") return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">01 · Execution steps</div>
        <p className="text-xs text-gray-500 mt-1">Execution steps mapped for the selected scenario.</p>
        <ol className="flex flex-col gap-1.5 mt-3">
          {(data?.steps || []).map((step) => (
            <li key={step} className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">·</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-end">
        <ActionButton onClick={() => onContinue?.("steps")} loading={loading}>
          Pull input data
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "pull") return null;

  if (type === "identify") return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">03 · Data masking</div>
        <p className="text-xs text-gray-500 mt-1">Review the detected columns before masking.</p>
        <div className="overflow-x-auto border border-gray-200 rounded-xl mt-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Column", "Detected type", "Sensitive", "Masking"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.reviewRows || []).map((row) => (
                <tr key={row.column} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-900">{row.column}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{row.detectedType}</td>
                  <td className="px-3 py-2.5">
                    {row.sensitive
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700">Yes</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500">No</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.maskingRequired
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700">Required</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex flex-wrap gap-2">
        <ActionButton onClick={() => onContinue?.("identifyColumns")} loading={loading}>Identify columns to mask</ActionButton>
        <ActionButton onClick={() => onContinue?.("identify")} loading={loading}>Mask data and preview</ActionButton>
      </div>
    </div>
  );

  if (type === "mask") return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">04 · Data masking</div>
        <div className="flex items-center gap-2 mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Data masking completed successfully.
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(data?.maskedColumns || []).map((col) => (
            <span key={col} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700">{col}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">{data?.rows} records ready for synthetic data generation.</p>
      </div>
      <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-end">
        <ActionButton onClick={() => onContinue?.("mask")} loading={loading}>
          Generate synthetic data
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "generate") return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">05 · Generate synthetic data</div>
        <h2 className="text-sm font-semibold text-gray-900 mt-2">{data?.outputFilename}</h2>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/60">
            <p className="text-xs text-gray-500 mb-0.5">Generated records</p>
            <strong className="text-sm font-bold text-gray-900">{data?.rows}</strong>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/60">
            <p className="text-xs text-gray-500 mb-0.5">Mode</p>
            <strong className="text-sm font-bold text-gray-900">{data?.mode}</strong>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-end">
        <ActionButton onClick={() => onContinue?.("generate")} loading={loading}>
          Push data to ART
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "push") return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-2">06 · Push data to ART</div>
        <div className="flex items-center gap-2 mt-3 px-3.5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {data?.message}
        </div>
        <p className="text-xs text-gray-500 mt-3">Target: <span className="font-medium text-gray-700">{data?.target}</span> · Execution path: <span className="font-medium text-gray-700">{data?.api}</span></p>
      </div>
    </div>
  );

  return null;
}
