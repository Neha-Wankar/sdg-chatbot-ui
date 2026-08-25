import { useEffect, useMemo, useState } from "react";

function getInitialValues(fields, previous = {}) {
  return fields.reduce((acc, field) => {
    acc[field.name] = previous[field.name] ?? field.defaultValue ?? "";
    return acc;
  }, {});
}

function ReadOnlySummary({ step, values }) {
  return (
    <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm mt-3 overflow-hidden">
      {/* Summary header */}
      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/70 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Submitted values</div>
          <div className="font-semibold text-sm text-gray-900 leading-tight mt-0.5">{step.name}</div>
        </div>
      </div>

      {/* Read-only fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(step.fields || []).map((field) => (
            <div key={field.name}>
              <div className="text-xs font-semibold mb-1 text-brand-700">{field.label}</div>
              <div className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 min-h-[38px] flex items-center">
                {values[field.name] || <span className="text-gray-400 italic">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DynamicStepForm({ step, initialValues = {}, onSubmit, loading, disabled, hideSubmit, readOnly }) {
  const [values, setValues] = useState(() => getInitialValues(step.fields || [], initialValues));
  const [errors, setErrors] = useState({});

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    setValues(getInitialValues(step.fields || [], initialValues));
    setErrors({});
  }, [step.id]); // intentionally depends only on step.id to reset on step change
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    (step.fields || []).forEach((field) => {
      if (field.required && !String(values[field.name] || "").trim())
        nextErrors[field.name] = "This field is required.";
      if (field.type === "date" && field.futureOnly && values[field.name] && values[field.name] <= minDate)
        nextErrors[field.name] = "Please select a future date.";
    });
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSubmit?.(values);
  };

  if (readOnly) {
    return <ReadOnlySummary step={step} values={values} />;
  }

  return (
    <form
      className="bg-white border border-gray-200 rounded-2xl shadow-sm mt-3 overflow-hidden"
      onSubmit={submit}
    >
      {/* Form header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Input required</div>
            <div className="font-semibold text-sm text-gray-900 leading-tight">{step.name}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1.5">Please provide the following information to continue.</div>
      </div>

      {/* Fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(step.fields || []).map((field) => (
            <div key={field.name}>
              <label
                className="block text-xs font-semibold mb-1.5 text-brand-700"
                htmlFor={`step-${step.id}-${field.name}`}
              >
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={`step-${step.id}-${field.name}`}
                type={field.type || "text"}
                value={values[field.name]}
                min={field.type === "date" && field.futureOnly ? minDate : undefined}
                onChange={(e) => update(field.name, e.target.value)}
                disabled={loading || disabled}
                className={`w-full text-sm px-3 py-2.5 rounded-xl border outline-none transition
                  ${errors[field.name]
                    ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
                    : "border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                  }
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {!hideSubmit && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex justify-end">
          <button
            type="submit"
            disabled={loading || disabled}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-white font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
