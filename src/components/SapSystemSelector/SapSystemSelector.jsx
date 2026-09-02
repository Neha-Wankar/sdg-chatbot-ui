import { useEffect, useState } from "react";
import { ZONES, SYSTEMS, SAP_IDS } from "../../mock/sapSystems/sapSystems";

// ─── Panel colour themes: Source = blue, Target = emerald ─────────────────────
const PANEL_THEME = {
  source: {
    header:      "bg-brand-500",
    panelBorder: "border-blue-200",
    lightBg:     "bg-blue-50",
    lightBorder: "border-blue-200",
    text:        "text-blue-700",
    dot:         "bg-blue-500",
    rowBorder:   "border-white/20",
    progressFull:"bg-brand-500",
    progressHalf:"bg-blue-300",
    dividerBg:   "bg-blue-300",
    dashedBorder:"border-blue-300",
  },
  target: {
    header:      "bg-emerald-600",
    panelBorder: "border-emerald-200",
    lightBg:     "bg-emerald-50",
    lightBorder: "border-emerald-200",
    text:        "text-emerald-700",
    dot:         "bg-emerald-500",
    rowBorder:   "border-white/20",
    progressFull:"bg-emerald-500",
    progressHalf:"bg-emerald-300",
    dividerBg:   "bg-emerald-300",
    dashedBorder:"border-emerald-300",
  },
};

// System icons
const SYS_ICON = {
  DEV: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3" />
    </svg>
  ),
  RTE: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  PPD: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  PROD: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
    </svg>
  ),
};

// ─── Selection panel ──────────────────────────────────────────────────────────
function SelectionPanel({ label, isTarget, selectedZone, selectedSystem, onSelectZone, onSelectSystem, disabled }) {
  const t = isTarget ? PANEL_THEME.target : PANEL_THEME.source;

  const systemId   = selectedZone && selectedSystem ? (SAP_IDS[selectedZone]?.[selectedSystem] ?? "") : null;
  const isComplete = !!(selectedZone && selectedSystem && systemId);
  const progressW  = !selectedZone ? "w-0" : !selectedSystem ? "w-1/3" : !isComplete ? "w-2/3" : "w-full";

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border ${t.panelBorder} shadow-sm ${disabled ? "pointer-events-none" : ""}`}>

      {/* ── Panel title bar ── */}
      <div className={`px-3 py-2 flex items-center justify-between ${t.header}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            {isTarget ? (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
              </svg>
            )}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white leading-none">{label}</span>
        </div>
        {isComplete ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white">
            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Done
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-white/60">
            {!selectedZone ? "Pick a zone" : !selectedSystem ? "Pick a system" : "Confirm"}
          </span>
        )}
      </div>

      {/* ── Dashed separator ── */}
      <div className={`border-b-2 border-dashed ${isTarget ? "border-emerald-300" : "border-blue-300"}`} />

      {/* ── Progress bar ── */}
      <div className={`h-0.5 ${t.header}`}>
        <div className={`h-full bg-white/40 transition-all duration-500 ${progressW}`} />
      </div>

      {/* ── Three columns: Zone | System | System ID ── */}
      <div className="flex items-stretch">

        {/* ZONE column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`px-2.5 py-1.5 flex items-center gap-1 border-b border-white/20 ${t.header}`}>
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-extrabold shrink-0 bg-white/25 text-white">1</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/90">Zone</span>
          </div>
          {ZONES.map((zone) => {
            const isActive    = zone === selectedZone;
            const isHighlight = isActive && isComplete;
            return (
              <button
                key={zone}
                type="button"
                disabled={disabled}
                onClick={() => { onSelectZone(zone); onSelectSystem(null); }}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 border-b border-white/10 last:border-b-0 text-left transition-all duration-150
                  ${isHighlight ? `${t.header} text-white` : isActive ? `${t.lightBg} ${t.text}` : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                {isHighlight && <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-white/50" />}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHighlight ? "bg-white/70" : t.dot}`} />
                <span className={`text-[11px] ${isHighlight ? "font-extrabold" : isActive ? "font-bold" : "font-semibold"}`}>{zone}</span>
              </button>
            );
          })}
        </div>

        {/* Divider 1 */}
        <div className={`w-px shrink-0 self-stretch ${isTarget ? "bg-emerald-300" : "bg-blue-300"}`} />

        {/* SYSTEM column */}
        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${selectedZone ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div className={`px-2.5 py-1.5 flex items-center gap-1 border-b border-white/20 ${t.header}`}>
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-extrabold shrink-0 bg-white/25 text-white">2</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/90">System</span>
          </div>
          {SYSTEMS.map((sys) => {
            const isActive    = sys === selectedSystem;
            const hasId       = selectedZone ? SAP_IDS[selectedZone]?.[sys] !== "" : true;
            const isHighlight = isActive && isComplete;
            return (
              <button
                key={sys}
                type="button"
                disabled={disabled || !hasId || !selectedZone}
                onClick={() => onSelectSystem(sys)}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 border-b border-white/10 last:border-b-0 text-left transition-all duration-150
                  ${isHighlight
                    ? `${t.header} text-white`
                    : isActive
                      ? `${t.lightBg} ${t.text}`
                      : hasId
                        ? "bg-white text-gray-700 hover:bg-gray-50"
                        : "bg-white text-gray-300 cursor-not-allowed"}`}
              >
                {isHighlight && <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-white/50" />}
                <span className={isHighlight ? "text-white/80" : isActive ? t.text : "text-gray-400"}>{SYS_ICON[sys]}</span>
                <span className={`text-[11px] ${isHighlight ? "font-extrabold" : isActive ? "font-bold" : hasId ? "font-semibold" : "font-medium"}`}>{sys}</span>
                {!hasId && <span className="ml-auto text-[9px] text-gray-300 italic">N/A</span>}
              </button>
            );
          })}
        </div>

        {/* Divider 2 */}
        <div className={`w-px shrink-0 self-stretch ${isTarget ? "bg-emerald-300" : "bg-blue-300"}`} />

        {/* SYSTEM ID column */}
        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${selectedSystem ? "opacity-100" : "opacity-40"}`}>
          <div className={`px-2.5 py-1.5 flex items-center gap-1 border-b border-white/20 ${t.header}`}>
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-extrabold shrink-0 bg-white/25 text-white">3</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/90">System ID</span>
          </div>
          {SYSTEMS.map((sys) => {
            const id          = selectedZone ? (SAP_IDS[selectedZone]?.[sys] ?? "") : "";
            const isHighlight = sys === selectedSystem && isComplete;
            const isEmpty     = id === "";
            return (
              <div
                key={sys}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 border-b border-white/10 last:border-b-0 transition-all duration-150
                  ${isHighlight ? `${t.header} text-white` : "bg-white text-gray-700"}`}
              >
                {isHighlight && <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-white/50" />}
                {isEmpty ? (
                  <span className="text-[9px] text-gray-300 italic">N/A</span>
                ) : isHighlight ? (
                  <>
                    <span className="text-[11px] font-extrabold tracking-widest text-white">{id}</span>
                    <svg className="w-2.5 h-2.5 text-white/70 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <span className="text-[11px] font-mono font-semibold text-gray-400 tracking-widest">{id}</span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SapSystemSelector({ onConfirm, onChange, value, disabled, hideConfirmButton = false }) {
  const [sourceZone,   setSourceZone]   = useState(value?.sourceLandscape || null);
  const [sourceSystem, setSourceSystem] = useState(value?.source          || null);
  const [targetZone,   setTargetZone]   = useState(value?.targetLandscape || null);
  const [targetSystem, setTargetSystem] = useState(value?.target          || null);

  const sourceId = sourceZone && sourceSystem ? (SAP_IDS[sourceZone]?.[sourceSystem] ?? "") : null;
  const targetId = targetZone && targetSystem ? (SAP_IDS[targetZone]?.[targetSystem] ?? "") : null;
  const canConfirm = sourceZone && sourceSystem && sourceId && targetZone && targetSystem && targetId;

  useEffect(() => {
    onChange?.({
      sourceLandscape: sourceZone,
      source: sourceSystem,
      targetLandscape: targetZone,
      target: targetSystem,
    });
  }, [sourceZone, sourceSystem, targetZone, targetSystem, onChange]);

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-900 leading-tight tracking-tight">Select SAP Systems</p>
            <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
              Choose a Zone and System for Source and Target to reveal the System ID.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[!!sourceZone, !!sourceSystem, !!targetZone, !!targetSystem].map((done, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${done ? "bg-brand-500 scale-110" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      {/* ── Two panels ── */}
      <div className="p-3 grid grid-cols-[1fr_auto_1fr] gap-3 items-start">

        <SelectionPanel
          label="Source Landscape"
          isTarget={false}
          selectedZone={sourceZone}
          selectedSystem={sourceSystem}
          onSelectZone={setSourceZone}
          onSelectSystem={setSourceSystem}
          disabled={disabled}
        />

        {/* ── Connector ── */}
        <div className="flex flex-col items-center justify-center gap-1.5 pt-10 px-0.5">
          <div className="flex flex-col items-center gap-0.5">
            {[0,1,2,3].map((i) => (
              <span key={i} className={`block w-0.5 h-1.5 rounded-full transition-all duration-300 ${canConfirm ? "bg-brand-400" : "bg-gray-200"}`} />
            ))}
          </div>
          <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300
            ${canConfirm ? "bg-brand-500 border-brand-500" : "bg-white border-gray-200"}`}>
            <svg className={`w-2.5 h-2.5 ${canConfirm ? "text-white" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <div className="flex flex-col items-center gap-0.5">
            {[0,1,2,3].map((i) => (
              <span key={i} className={`block w-0.5 h-1.5 rounded-full transition-all duration-300 ${canConfirm ? "bg-emerald-400" : "bg-gray-200"}`} />
            ))}
          </div>
          <span className="text-[7px] font-bold uppercase tracking-widest text-gray-300 text-center leading-tight">
            maps<br/>to
          </span>
        </div>

        <SelectionPanel
          label="Target Landscape"
          isTarget={true}
          selectedZone={targetZone}
          selectedSystem={targetSystem}
          onSelectZone={setTargetZone}
          onSelectSystem={setTargetSystem}
          disabled={disabled}
        />

      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400 shrink-0">Route:</span>
          {canConfirm ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500 text-white text-[11px] font-bold tracking-wide leading-none shrink-0">
                <span className="w-1 h-1 rounded-full bg-white/70 shrink-0" />
                {sourceZone} › {sourceSystem} › {sourceId}
              </span>
              <svg className="w-2.5 h-2.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold tracking-wide leading-none shrink-0">
                <span className="w-1 h-1 rounded-full bg-white/70 shrink-0" />
                {targetZone} › {targetSystem} › {targetId}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium italic">
              Complete both Source and Target selections to continue.
            </span>
          )}
        </div>

        {!hideConfirmButton && (
          <button
            type="button"
            disabled={!canConfirm || disabled}
            onClick={() => onConfirm?.({ source: sourceSystem, sourceLandscape: sourceZone, target: targetSystem, targetLandscape: targetZone })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold tracking-wide text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm shadow-brand-500/25 transition-all shrink-0"
          >
            Confirm &amp; Search Scenarios
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

    </div>
  );
}
