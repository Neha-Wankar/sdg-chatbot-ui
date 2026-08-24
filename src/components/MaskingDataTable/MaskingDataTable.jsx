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

function SortIcon({ dir }) {
  if (!dir) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" style={{ color: "rgb(65 116 192)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      {dir === "asc"
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
    </svg>
  );
}

export default function MaskingDataTable({ initialRows }) {
  const [rows, setRows] = useState(initialRows ?? DEFAULT_ROWS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "column", dir: "asc" });
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const colPanelRef = useRef(null);

  /* ── sort ── */
  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  /* ── visible columns ── */
  const visibleCols = COLUMNS.filter((c) => !hiddenCols.has(c.key));

  const toggleCol = (key) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* ── filtered + sorted rows ── */
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

  /* ── CSV download ── */
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

  /* ── update mask provider ── */
  const updateMaskProvider = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, maskProvider: value } : r)));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
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
            className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Download CSV */}
          <button
            type="button"
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download CSV
          </button>

          {/* Hide/Show columns */}
          <div className="relative" ref={colPanelRef}>
            <button
              type="button"
              onClick={() => setColPanelOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Columns
              {hiddenCols.size > 0 && (
                <span
                  className="ml-0.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: "rgb(65 116 192)" }}
                >
                  {hiddenCols.size}
                </span>
              )}
            </button>

            {colPanelOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[160px] py-1.5">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
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
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:bg-gray-100 transition" : ""}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.key === "maskProvider" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
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
                <td colSpan={visibleCols.length} className="px-4 py-8 text-center text-xs text-gray-400">
                  No columns match your search.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  {visibleCols.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {col.key === "maskProvider" ? (
                        <select
                          value={row.maskProvider}
                          onChange={(e) => updateMaskProvider(row.id, e.target.value)}
                          className="text-sm px-2 py-1 rounded-lg border border-gray-200 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white cursor-pointer text-gray-800"
                        >
                          {MASK_PROVIDERS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      ) : (
                        row[col.key]
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
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        Showing {displayRows.length} of {rows.length} rows
      </div>
    </div>
  );
}
