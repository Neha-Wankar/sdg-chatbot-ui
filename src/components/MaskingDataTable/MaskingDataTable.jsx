import { useMemo, useRef, useState } from "react";
import {
  DEFAULT_MASKING_ROWS,
  HASHES,
  MASKING_COLUMNS,
  MASK_PROVIDERS,
  MAX_RECORDS,
  MIN_RECORDS,
  PREVIEW_COLUMNS,
  PROVIDER_COLORS,
  QTYS,
  SOLD_TO,
  SYNTHETIC_BATCHES,
  SYNTHETIC_LOCATIONS,
  SYNTHETIC_MATERIALS,
  UNITS,
} from "../../mock/maskingData/maskingData";

function generatePreviewRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    SalesOrderType:                "OR",
    DistributionChannel:           "10",
    SoldToParty:                   "17100001",
    IncotermsLocation1:            SOLD_TO[i % SOLD_TO.length],
    to_Item_Material:              HASHES[i % HASHES.length],
    to_Item_RequestedQuantity:     QTYS[i % QTYS.length],
    to_Item_RequestedQuantityUnit: UNITS[i % UNITS.length],
    SalesOrganization:             "1710",
    OrganizationDivision:          "0",
    IncotermsLocation2:            "KYZYLORDA",
    to_Item_ProductionPlant:       "1710",
    to_Item_StorageLocation:       "1722",
    to_Item_Batch:                 "",
    CustomerPaymentTerms:          "4",
  }));
}


function generateSyntheticRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    SalesOrderType:                "OR",
    DistributionChannel:           String((i % 3) + 10),
    SoldToParty:                   String(17100001 + (i % 5)),
    IncotermsLocation1:            SYNTHETIC_LOCATIONS[i % SYNTHETIC_LOCATIONS.length],
    to_Item_Material:              SYNTHETIC_MATERIALS[i % SYNTHETIC_MATERIALS.length],
    to_Item_RequestedQuantity:     QTYS[i % QTYS.length],
    to_Item_RequestedQuantityUnit: UNITS[i % UNITS.length],
    SalesOrganization:             "1710",
    OrganizationDivision:          String(i % 4),
    IncotermsLocation2:            SYNTHETIC_LOCATIONS[(i + 3) % SYNTHETIC_LOCATIONS.length],
    to_Item_ProductionPlant:       "1710",
    to_Item_StorageLocation:       String(1720 + (i % 5)),
    to_Item_Batch:                 SYNTHETIC_BATCHES[i % SYNTHETIC_BATCHES.length],
    CustomerPaymentTerms:          String((i % 4) + 1),
  }));
}

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

// ── Reusable data-table toolbar + table ──────────────────────────────────────
const PAGE_SIZE = 10;

function DataTable({ columns, dataRows, title, badge }) {
  const [search, setSearch]           = useState("");
  const [sort, setSort]               = useState({ key: null, dir: null });
  const [hiddenCols, setHiddenCols]   = useState(new Set());
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [page, setPage]               = useState(1);
  const colPanelRef = useRef(null);

  const visibleCols = columns.filter((c) => !hiddenCols.has(c.key));

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const toggleCol = (key) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? dataRows.filter((r) => columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q)))
      : [...dataRows];
    if (sort.key) {
      result.sort((a, b) => {
        const av = String(a[sort.key] ?? "").toLowerCase();
        const bv = String(b[sort.key] ?? "").toLowerCase();
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [dataRows, search, sort, columns]);

  const paginate    = filteredRows.length > PAGE_SIZE;
  const totalPages  = paginate ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE)) : 1;
  const safePage    = paginate ? Math.min(page, totalPages) : 1;
  const displayRows = paginate ? filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) : filteredRows;

  // Reset to page 1 whenever search/sort changes
  useMemo(() => { setPage(1); }, [search, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloadCSV = () => {
    const cols = visibleCols;
    const header = cols.map((c) => c.label).join(",");
    const body = dataRows
      .map((r) => cols.map((c) => `"${String(r[c.key] ?? "").replace(/\n/g, " ").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "masked-data-preview.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {title && (
        <div className="px-3.5 pt-3 pb-2.5 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-xs font-semibold text-gray-900">{title}</h2>
          {badge && <span className="text-green-600 text-xs font-medium">{badge}</span>}
        </div>
      )}
      {/* Toolbar */}
      <div className="px-3.5 py-2 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50/50">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search data…"
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
          {columns.length > 2 && (
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
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-1.5 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
                  Toggle columns
                </div>
                {columns.map((col) => (
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
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full font-sans text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
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
                <td colSpan={visibleCols.length} className="px-3 py-8 text-center text-xs font-sans text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                  </svg>
                  No rows match your search.
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIdx) => (
                <tr key={row.id} className={`transition-colors hover:bg-gray-50/60 ${rowIdx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  {visibleCols.map((col) => (
                    <td key={col.key} className="px-3 py-1.5 text-xs font-sans text-gray-800 whitespace-pre-wrap max-w-[160px]">
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-3.5 py-2 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-600">
            {paginate
              ? `${filteredRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredRows.length)}`
              : filteredRows.length}
          </span>{" "}
          of <span className="font-semibold text-gray-600">{filteredRows.length}</span> rows
          {filteredRows.length !== dataRows.length && (
            <span className="ml-1">(filtered from {dataRows.length})</span>
          )}
        </span>

        <div className="flex items-center gap-1">
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mr-2 text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              Clear search
            </button>
          )}

          {paginate && (
            <>
              {/* Prev */}
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg border text-xs font-medium transition ${
                        p === safePage
                          ? "bg-brand-500 border-brand-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MaskingDataTable({ initialRows }) {
  const [rows, setRows] = useState(initialRows ?? DEFAULT_MASKING_ROWS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "column", dir: "asc" });
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const colPanelRef = useRef(null);
  const [isDirty, setIsDirty] = useState(true);
  const [maskingGenerated, setMaskingGenerated] = useState(false);

  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDone, setPreviewDone]       = useState(false);
  const [previewRows, setPreviewRows]       = useState([]);
  const [previewCount, setPreviewCount]         = useState(1000);
  const [previewCountTouched, setPreviewCountTouched] = useState(true);
  const [syntheticLoading, setSyntheticLoading] = useState(false);
  const [syntheticDone, setSyntheticDone]       = useState(false);
  const [syntheticRows, setSyntheticRows]       = useState([]);

  const adjustPreviewCount = (delta) => {
    setPreviewCount((prev) => Math.min(MAX_RECORDS, Math.max(MIN_RECORDS, prev + delta)));
    setPreviewCountTouched(true);
    setSyntheticDone(false);
    setSyntheticRows([]);
  };

  const handlePreviewCountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setPreviewCount(raw === "" ? "" : Number(raw));
    setPreviewCountTouched(true);
    setSyntheticDone(false);
    setSyntheticRows([]);
  };

  const handlePreviewCountBlur = () => {
    const n = Number(previewCount);
    if (previewCount === "" || Number.isNaN(n) || n < MIN_RECORDS) setPreviewCount(MIN_RECORDS);
    else if (n > MAX_RECORDS) setPreviewCount(MAX_RECORDS);
  };

  const handleGenerateSynthetic = () => {
    setSyntheticLoading(true);
    setSyntheticDone(false);
    setSyntheticRows([]);
    setTimeout(() => {
      setSyntheticRows(generateSyntheticRows(Math.min(previewCount, 10)));
      setSyntheticLoading(false);
      setSyntheticDone(true);
      setPreviewCountTouched(false);
    }, 2000);
  };

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const visibleCols = MASKING_COLUMNS.filter((c) => !hiddenCols.has(c.key));

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
      ? rows.filter((r) => MASKING_COLUMNS.some((c) => String(r[c.key]).toLowerCase().includes(q)))
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

  const markDirty = () => {
    setIsDirty(true);
    setMaskingGenerated(false);
    setPreviewDone(false);
    setPreviewLoading(false);
    setPreviewRows([]);
  };

  const updateMaskProvider = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, maskProvider: value } : r)));
    markDirty();
  };

  const handlePreview = () => {
    setPreviewLoading(true);
    setPreviewDone(false);
    setPreviewRows([]);
    setTimeout(() => {
      setPreviewRows(generatePreviewRows(20));
      setPreviewLoading(false);
      setPreviewDone(true);
    }, 2000);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table heading */}
        <div className="px-3.5 pt-3 pb-2.5 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-900">Review and Configure Masking</h2>
        </div>
        {/* Toolbar */}
        <div className="px-3.5 py-2 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50/50">
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
            {MASKING_COLUMNS.length > 2 && (
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
                  {MASKING_COLUMNS.map((col) => (
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
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full font-sans text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
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
                  <td colSpan={visibleCols.length} className="px-3 py-8 text-center text-xs font-sans text-gray-400">
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
                      <td key={col.key} className="px-3 py-2 text-xs font-sans text-gray-800 whitespace-nowrap">
                        {col.key === "maskProvider" ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${PROVIDER_COLORS[row.maskProvider] || PROVIDER_COLORS.none}`}>
                              {row.maskProvider}
                            </span>
                            <select
                              value={row.maskProvider}
                              onChange={(e) => updateMaskProvider(row.id, e.target.value)}
                              className="text-xs font-sans px-2 py-1 rounded-lg border border-gray-200 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/15 bg-white cursor-pointer text-gray-600"
                            >
                              {MASK_PROVIDERS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs font-sans text-gray-700">{row[col.key]}</span>
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
        <div className="px-3.5 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
          <span>Showing <span className="font-semibold text-gray-600">{displayRows.length}</span> of <span className="font-semibold text-gray-600">{rows.length}</span> rows</span>
          {search && (
            <button onClick={() => setSearch("")} className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Generate masking configuration */}
      <div className="mt-2 flex flex-col items-end gap-1.5">
        {maskingGenerated && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Masking configuration generated successfully!.
          </div>
        )}
        <div className="flex items-center gap-2">
          {maskingGenerated && !isDirty && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading || previewDone}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-brand-600 text-brand-600 hover:bg-brand-50 active:bg-brand-100 text-xs font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Masking Data
            </button>
          )}
          <button
            type="button"
            disabled={!isDirty}
            onClick={() => { setMaskingGenerated(true); setIsDirty(false); }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Confirm Masking Configuration
          </button>
        </div>
      </div>

      {/* Loading banner */}
      {previewLoading && (
        <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
          <svg className="w-4 h-4 animate-spin shrink-0 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Data masking is running…
        </div>
      )}

      {/* Preview table */}
      {previewDone && previewRows.length > 0 && (
        <div className="mt-3">
          <DataTable
            columns={PREVIEW_COLUMNS}
            dataRows={previewRows}
            title="Masked Data Preview"
            badge="✅ Data masked!"
          />

          <div className="mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Masking completed and preview loaded.
          </div>

          {/* Number of records */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-3.5 py-3 flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2.5">
              <div className="text-xs font-semibold text-gray-900">Number of records to generate</div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustPreviewCount(-1)}
                  disabled={previewCount <= MIN_RECORDS}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition select-none"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={previewCount}
                  onFocus={() => setPreviewCountTouched(true)}
                  onChange={handlePreviewCountChange}
                  onBlur={handlePreviewCountBlur}
                  className="w-24 text-center text-sm font-semibold text-gray-800 px-2 py-1.5 rounded-xl border border-brand-300 outline-none focus:ring-2 focus:ring-brand-500/15 transition bg-brand-50"
                />
                <button
                  type="button"
                  onClick={() => adjustPreviewCount(1)}
                  disabled={previewCount >= MAX_RECORDS}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition select-none"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateSynthetic}
              disabled={syntheticLoading || !previewCountTouched}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {syntheticLoading ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {syntheticLoading ? "Generating…" : "Generate Synthetic Data"}
            </button>
          </div>
          {/* Synthetic loading banner */}
          {syntheticLoading && (
            <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
              <svg className="w-4 h-4 animate-spin shrink-0 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Generating synthetic data…
            </div>
          )}

          {/* Synthetic done */}
          {syntheticDone && syntheticRows.length > 0 && (
            <div className="mt-3">
              {/* Success message */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium mb-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Synthetic data generated successfully!
              </div>
              {/* Info message */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                Generated {previewCount.toLocaleString()} records with {PREVIEW_COLUMNS.length} columns
              </div>
              {/* Synthetic table */}
              <DataTable
                columns={PREVIEW_COLUMNS}
                dataRows={syntheticRows}
                title="Generated Synthetic Data Preview"
                badge={`✅ Synthetic data unmasked! --> (showing first ${syntheticRows.length})`}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Push data to target system
                </button>
              </div>
          </div>
          )}
        </div>
      )}
    </>
  );
}
