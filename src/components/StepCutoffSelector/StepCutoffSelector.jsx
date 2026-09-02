import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;

// Walks up the DOM to find the nearest scrollable ancestor
function getScrollParent(el) {
  while (el && el !== document.body) {
    const { overflowY } = window.getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return window;
}

export default function StepCutoffSelector({
  scenario,
  onConfirm,
  disabled,
  confirmed = false,
}) {
  const steps = Array.isArray(scenario?.steps) ? scenario.steps : [];

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(steps.length / PAGE_SIZE));

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, steps.length);

  const visibleSteps = useMemo(
    () => steps.slice(pageStart, pageEnd),
    [steps, pageStart, pageEnd]
  );

  const selectedStep =
    selectedIndex !== null ? steps[selectedIndex] : null;

  // Ref to the card root — used to find the scroll parent
  const cardRef = useRef(null);
  // Saved scroll position before a page change
  const savedScrollRef = useRef(null);

  // If the backend returns a different number of steps, make sure the
  // current page is still valid.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // After every currentPage change, restore the scroll position synchronously
  // before the browser paints — this prevents any visible jump.
  useLayoutEffect(() => {
    if (savedScrollRef.current === null) return;
    const { scrollParent, scrollTop } = savedScrollRef.current;
    if (scrollParent === window) {
      window.scrollTo({ top: scrollTop });
    } else {
      scrollParent.scrollTop = scrollTop;
    }
    savedScrollRef.current = null;
  }, [currentPage]);

  // "Select all" means the test cutoff is the final process step.
  const handleSelectAll = (checked) => {
    setSelectAll(checked);

    if (checked) {
      if (steps.length > 0) {
        setSelectedIndex(steps.length - 1);
        setCurrentPage(totalPages);
      }
      return;
    }

    // Unchecking Select All returns the user to normal cutoff selection.
    setSelectedIndex(null);
    setCurrentPage(1);
  };

  const handleStepSelect = (index) => {
    if (disabled) return;

    setSelectAll(false);
    setSelectedIndex(index);
  };

  const goToPage = (page, e) => {
    e?.preventDefault();
    e?.currentTarget?.blur();

    // Snapshot scroll position BEFORE state update triggers a re-render
    if (cardRef.current) {
      const scrollParent = getScrollParent(cardRef.current);
      const scrollTop = scrollParent === window
        ? window.scrollY
        : scrollParent.scrollTop;
      savedScrollRef.current = { scrollParent, scrollTop };
    }

    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  const canConfirm = selectedIndex !== null && steps.length > 0;

  return (
    <div ref={cardRef} className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>

          <span className="text-xs font-bold text-gray-900">
            Identified Scenario:{" "}
            <span className="text-brand-600">{scenario?.name}</span>
          </span>
        </div>

        <p className="text-[11px] text-gray-500 ml-7">
          {confirmed
            ? "Selected test range is shown below."
            : "Select up to which step you want to perform the test."}
        </p>
      </div>

      {/* Select all */}
      <div
        className={`px-3.5 py-2 border-b border-gray-100 flex items-center justify-between gap-3 transition-colors ${
          selectAll ? "bg-brand-50" : "bg-white"
        }`}
      >
        {/* Left: icon + label + count */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Animated checkmark icon */}
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
              selectAll
                ? "bg-brand-500 shadow-sm shadow-brand-500/30"
                : "bg-gray-100"
            }`}
          >
            {selectAll ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <p className={`text-xs font-semibold leading-tight ${selectAll ? "text-brand-700" : "text-gray-800"}`}>
              Select all process steps
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {selectAll
                ? `All ${steps.length} steps will be included`
                : `${steps.length} step${steps.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>

        {/* Right: custom toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={selectAll}
          disabled={disabled || steps.length === 0}
          onClick={() => handleSelectAll(!selectAll)}
          className={`relative shrink-0 w-11 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
            selectAll
              ? "bg-brand-500 border-brand-500"
              : "bg-gray-200 border-gray-200 hover:border-gray-300"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              selectAll ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Page range label ──────────────────────────────────────────── */}
      {steps.length > 0 && (
        <div className="px-3.5 pt-2 pb-0 flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-400">
            Showing steps{" "}
            <span className="font-semibold text-gray-600">{pageStart + 1}–{pageEnd}</span>
            {" "}of {steps.length}
          </span>
          {totalPages > 1 && (
            <span className="text-[11px] font-medium text-gray-400">
              Page <span className="font-semibold text-gray-600">{currentPage}</span> of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Steps list */}
      <div className="px-3.5 py-2 flex flex-col gap-1">
        {visibleSteps.map((step, localIndex) => {
          const index = pageStart + localIndex;

          // Selecting Step N includes every step from 1 through N.
          const isSelected = selectedIndex === index;
          const isBeforeSelected =
            selectedIndex !== null && index < selectedIndex;
          const isBeyondSelected =
            selectedIndex !== null && index > selectedIndex;

          return (
            <button
              key={step.id || index}
              type="button"
              disabled={disabled}
              onClick={() => handleStepSelect(index)}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl border transition-all ${
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
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm"
                    : isBeforeSelected
                    ? "bg-brand-500 text-white"
                    : isBeyondSelected
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isBeforeSelected ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12.5l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>

              {/* Step name */}
              <span
                className={`flex-1 text-xs font-medium ${
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

              {/* Up to here */}
              {isSelected && (
                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200 whitespace-nowrap">
                  {selectAll ? "All steps" : "Up to here"}
                </span>
              )}

              {/* Included indicator */}
              {isBeforeSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-brand-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}

              {/* Radio indicator */}
              {!isSelected &&
                !isBeforeSelected &&
                !isBeyondSelected && (
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
            </button>
          );
        })}

        {steps.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            No process steps are available for this scenario.
          </div>
        )}
      </div>

      {/* Pagination */}
      {steps.length > PAGE_SIZE && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={(e) => goToPage(currentPage - 1, e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={(e) => goToPage(page, e)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === page
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600"
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={(e) => goToPage(currentPage + 1, e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-3.5 py-2 border-t border-gray-100 bg-gray-50/40 flex items-center justify-end gap-3">
        {!confirmed && (
          <button
            type="button"
            disabled={!canConfirm || disabled}
            onClick={() =>
              onConfirm({
                upToIndex: selectedIndex,
                upToStep: selectedStep,
                selectAll,
              })
            }
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm shadow-brand-500/25 transition-all shrink-0"
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

