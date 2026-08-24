import { useMemo, useRef, useState } from "react";

const MASK_PROVIDERS = ["SAP_CODE", "CITY", "HASH", "FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE", "DATE", "none"];

const DEFAULT_ROWS = [
  { id: 1,  column: "to_Item[0].StorageLocation",      maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 2,  column: "IncotermsLocation1",               maskProvider: "CITY",     source: "name_rule"     },
  { id: 3,  column: "to_Item[0].RequestedQuantityUnit", maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 4,  column: "OrganizationDivision",             maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 5,  column: "to_Item[0].Material",              maskProvider: "HASH",     source: "none"          },
  { id: 6,  column: "DistributionChannel",              maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 7,  column: "SalesOrganization",                maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 8,  column: "to_Item[0].RequestedQuantity",     maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 9,  column: "SoldToParty",                      maskProvider: "SAP_CODE", source: "dpt"           },
  { id: 10, column: "to_Item[0].ProductionPlant",       maskProvider: "SAP_CODE", source: "sap_code_rule" },
];

const COLUMNS = [
  { key: "column",       label: "Column",           sortable: true },
  { key: "maskProvider", label: "Masking provider", sortable: true },
  { key: "source",       label: "Source",           sortable: true },
];

const PROVIDER_COLORS = {
  SAP_CODE:   "bg-blue-50 text-blue-700 border-blue-200",
  CITY:       "bg-violet-50 text-violet-700 border-violet-200",
  HASH:       "bg-slate-50 text-slate-600 border-slate-200",
  FIRST_NAME: "bg-pink-50 text-pink-700 border-pink-200",
  LAST_NAME:  "bg-rose-50 text-rose-700 border-rose-200",
  EMAIL:      "bg-amber-50 text-amber-700 border-amber-200",
  PHONE:      "bg-teal-50 text-teal-700 border-teal-200",
  DATE:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  none:       "bg-gray-50 text-gray-500 border-gray-200",
};

function SortIcon({ dir }) {
  if (!dir) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      {dir === "asc"
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
    </svg>
  );
}

const MIN_RECORDS = 1;
const MAX_RECORDS = 100000;

export default function MaskingDataTable({ initialRows }) {
  const [recordCount, setRecordCount] = useState(1000);
  const [rows, setRows] = useState(initialRows ?? DEFAULT_ROWS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "column", dir: "asc" });
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const colPanelRef = useRef(null);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const visibleCols = COLUMNS.filter((c) => !hiddenCols.has(c.key));

  const toggleCol = (key) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const displayRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? rows.filter((r) => COLUMNS.some((c) => String(r[c.key]).toLowerCase().includes(q)))
      : [...rows];

    if (sort.key) {
      result.sort((a, b) => {
        const av = String(a[sort.key]).toLowerCase();
        const bv = String(b[sort.key]).toLowerCase();
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [rows, search, sort]);

  const downloadCSV = () => {
    const cols = visibleCols;
    const header = cols.map((c) => c.label).join(",");
    const body = rows
      .map((r) => cols.map((c) => `"${String(r[c.key]).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "masking-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateMaskProvider = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, maskProvider: value } : r)));
  };

  const clamp = (v) => Math.min(MAX_RECORDS, Math.max(MIN_RECORDS, v));
  const adjustCount = (delta) => setRecordCount((prev) => clamp(prev + delta));
  const handleCountInput = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") { setRecordCount(""); return; }
    setRecordCount(clamp(Number(raw)));
  };
  const handleCountBlur = () => {
    if (recordCount === "" || Number.isNaN(Number(recordCount))) setRecordCount(1000);
  };

  return (
    <>
      {/* Number of records */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">Number of records to generate</div>
          <div className="text-xs text-gray-400 mt-0.5">Between {MIN_RECORDS.toLocaleString()} and {MAX_RECORDS.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => adjustCount(-1)}
            disabled={recordCount <= MIN_RECORDS}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition select-none"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={recordCount}
            onChange={handleCountInput}
            onBlur={handleCountBlur}
            className="w-24 text-center text-sm font-semibold text-gray-800 px-2 py-1.5 rounded-xl border border-brand-300 outline-none focus:ring-2 focus:ring-brand-500/15 transition bg-brand-50"
          />
          <button
            type="button"
            onClick={() => adjustCount(1)}
            disabled={recordCount >= MAX_RECORDS}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition select-none"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50/50">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search columns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-7 pr-3 py-2 rounded-xl border border-gray-200 bg-white outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Download CSV */}
            <button
              type="button"
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>

            {/* Columns toggle */}
            <div className="relative" ref={colPanelRef}>
              <button
                type="button"
                onClick={() => setColPanelOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Columns
                {hiddenCols.size > 0 && (
                  <span className="ml-0.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center bg-brand-500">
                    {hiddenCols.size}
                  </span>
                )}
              </button>

              {colPanelOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[160px] py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
                    Toggle columns
                  </div>
                  {COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!hiddenCols.has(col.key)}
                        onChange={() => toggleCol(col.key)}
                        className="accent-brand-500 w-3 h-3"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon dir={sort.key === col.key ? sort.dir : null} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length} className="px-4 py-10 text-center text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                    </svg>
                    No columns match your search.
                  </td>
                </tr>
              ) : (
                displayRows.map((row, rowIdx) => (
                  <tr key={row.id} className={`transition-colors hover:bg-gray-50/60 ${rowIdx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    {visibleCols.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                        {col.key === "maskProvider" ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PROVIDER_COLORS[row.maskProvider] || PROVIDER_COLORS.none}`}>
                              {row.maskProvider}
                            </span>
                            <select
                              value={row.maskProvider}
                              onChange={(e) => updateMaskProvider(row.id, e.target.value)}
                              className="text-xs px-2 py-1 rounded-lg border border-gray-200 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/15 bg-white cursor-pointer text-gray-600"
                            >
                              {MASK_PROVIDERS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-gray-700">{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
          <span>Showing <span className="font-semibold text-gray-600">{displayRows.length}</span> of <span className="font-semibold text-gray-600">{rows.length}</span> rows</span>
          {search && (
            <button onClick={() => setSearch("")} className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
              Clear search
            </button>
          )}
        </div>
      </div>
    </>
  );
}
