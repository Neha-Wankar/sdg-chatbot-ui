import { useEffect, useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────────
const LANDSCAPES = [
  { key: "DEV",  systems: ["ND2", "HBJ", "D5A"] },
  { key: "RTE",  systems: ["A7A", "HD0", "A8A", "TB6"] },
  { key: "PPOD", systems: ["E8A", "A8A", "CBD", "O8A", "ZXD"] },
  { key: "PROD", systems: ["C4D", "E9A", "A9A", "O9A", "HBX"] },
];

// ─── Two-column landscape/system table ────────────────────────────────────────
function LandscapeTable({ landscapes, selectedLandscape, selectedSystem, onSelectLandscape, onSelectSystem, isTarget, disabled }) {
  const activeLandscape = landscapes.find((l) => l.key === selectedLandscape) || null;

  const activeBg     = isTarget ? "bg-green-50"   : "bg-blue-50";
  const activeText   = isTarget ? "text-green-700" : "text-blue-700";
  const activeBorder = isTarget ? "bg-green-600"   : "bg-brand-500";

  return (
    <div className="flex border border-gray-200 rounded-b-xl overflow-hidden">
      {/* ENVIRONMENT column */}
      <div className="flex-1 border-r border-gray-200">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400 leading-none">
            Environment
          </span>
        </div>
        {landscapes.map((l) => {
          const isActive = l.key === selectedLandscape;
          return (
            <button
              key={l.key}
              type="button"
              disabled={disabled}
              onClick={() => {
                onSelectLandscape(l.key);
                onSelectSystem(null);
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-150 relative group
                ${isActive
                  ? `${activeBg} ${activeText}`
                  : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isActive && (
                <span className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full ${activeBorder}`} />
              )}
              <span className={`pl-2 text-[13px] leading-snug tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                {l.key}
              </span>
            </button>
          );
        })}
      </div>

      {/* SYSTEM column */}
      <div className="flex-1">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400 leading-none">
            System
          </span>
        </div>
        {activeLandscape
          ? activeLandscape.systems.map((sys) => {
              const isActive = sys === selectedSystem;
              return (
                <button
                  key={sys}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSystem(sys)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-150 relative
                    ${isActive
                      ? `${activeBg} ${activeText}`
                      : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900"}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isActive && (
                    <span className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full ${activeBorder}`} />
                  )}
                  <span className={`pl-2 text-[13px] leading-snug tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                    {sys}
                  </span>
                </button>
              );
            })
          : (
            <div className="flex flex-col items-center justify-center py-10 gap-1.5 select-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h10" />
              </svg>
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">Select an environment</span>
            </div>
          )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SapSystemSelector({ onConfirm, onChange, value, disabled, hideConfirmButton = false }) {
  const [sourceLandscape, setSourceLandscape] = useState(value?.sourceLandscape || null);
  const [sourceSystem, setSourceSystem] = useState(value?.source || null);
  const [targetLandscape, setTargetLandscape] = useState(value?.targetLandscape || null);
  const [targetSystem, setTargetSystem] = useState(value?.target || null);

  const canConfirm = sourceLandscape && sourceSystem && targetLandscape && targetSystem;

  useEffect(() => {
    onChange?.({ sourceLandscape, source: sourceSystem, targetLandscape, target: targetSystem });
  }, [sourceLandscape, sourceSystem, targetLandscape, targetSystem, onChange]);

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900 leading-tight tracking-tight">
              Select SAP Systems
            </p>
            <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
              Select a Source Landscape environment/system, then map it to a Target Landscape destination.
            </p>
          </div>
        </div>
      </div>

      {/* Two panels */}
      <div className="p-5 grid grid-cols-[1fr_auto_1fr] gap-5 items-start">

        {/* SOURCE panel */}
        <div className="rounded-xl overflow-hidden border border-blue-200 shadow-sm">
          <div className="px-4 py-2.5 bg-brand-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-white/90 leading-none">
              Source Landscape
            </span>
          </div>
          <LandscapeTable
            landscapes={LANDSCAPES}
            selectedLandscape={sourceLandscape}
            selectedSystem={sourceSystem}
            onSelectLandscape={setSourceLandscape}
            onSelectSystem={setSourceSystem}
            isTarget={false}
            disabled={disabled}
          />
        </div>

        {/* Arrow between panels */}
        <div className="flex items-center justify-center pt-[52px]">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {/* Dashed line segments */}
              {[0,1,2,3].map((i) => (
                <span key={i} className="block w-2 h-0.5 rounded-full bg-green-400 opacity-70" />
              ))}
              {/* Solid arrowhead circle */}
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 ml-0.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 leading-none">maps to</span>
          </div>
        </div>

        {/* TARGET panel */}
        <div className="rounded-xl overflow-hidden border border-green-200 shadow-sm">
          <div className="px-4 py-2.5 bg-emerald-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-200 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-white/90 leading-none">
              Target Landscape
            </span>
          </div>
          <LandscapeTable
            landscapes={LANDSCAPES}
            selectedLandscape={targetLandscape}
            selectedSystem={targetSystem}
            onSelectLandscape={setTargetLandscape}
            onSelectSystem={setTargetSystem}
            isTarget={true}
            disabled={disabled}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">

        {/* Selected route summary */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400 shrink-0">
            Route:
          </span>
          {canConfirm ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[12px] font-bold tracking-wide leading-none shrink-0">
                <span>{sourceLandscape}</span>
                <span className="text-blue-400 font-normal">›</span>
                <span>{sourceSystem}</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[12px] font-bold tracking-wide leading-none shrink-0">
                <span>{targetLandscape}</span>
                <span className="text-green-400 font-normal">›</span>
                <span>{targetSystem}</span>
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400 font-medium italic">
              Select both source and target to continue.
            </span>
          )}
        </div>

        {!hideConfirmButton && (
          <button
            type="button"
            disabled={!canConfirm || disabled}
            onClick={() =>
              onConfirm?.({
                source: sourceSystem,
                sourceLandscape,
                target: targetSystem,
                targetLandscape,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm shadow-brand-500/25 transition-all shrink-0"
          >
            Confirm &amp; Search Scenarios
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
}
