import { useEffect, useMemo, useState } from "react";

function getInitialValues(fields, previous = {}) {
  return fields.reduce((acc, field) => {
    acc[field.name] = previous[field.name] ?? field.defaultValue ?? "";
    return acc;
  }, {});
}

function ReadOnlySummary({ step, values }) {
  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-sm mt-3 overflow-hidden">
      {/* Summary header */}
      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Submitted values</div>
          <div className="font-semibold text-sm text-gray-900 mt-0.5">{step.name}</div>
        </div>
      </div>

      {/* Read-only fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(step.fields || []).map((field) => (
            <div key={field.name}>
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "rgb(69 97 139)" }}
              >
                {field.label}
              </div>
              <div className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 min-h-[38px] flex items-center">
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

  useEffect(() => {
    setValues(getInitialValues(step.fields || [], initialValues));
    setErrors({});
  }, [step.id]);

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
      className="bg-white border border-gray-200 rounded-xl shadow-sm mt-3 overflow-hidden"
      onSubmit={submit}
    >
      {/* Form header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Input required</div>
        <div className="font-semibold text-sm text-gray-900 mt-0.5">{step.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">Please provide the following information to continue.</div>
      </div>

      {/* Fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(step.fields || []).map((field) => (
            <div key={field.name}>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: "rgb(69 97 139)" }}
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
                className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition
                  ${errors[field.name]
                    ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:border-[rgb(65_116_192)] focus:ring-2 focus:ring-[rgb(65_116_192)]/20"
                  }
                  disabled:bg-gray-50 disabled:text-gray-500`}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {!hideSubmit && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={loading || disabled}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white font-medium transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "rgb(65 116 192)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
