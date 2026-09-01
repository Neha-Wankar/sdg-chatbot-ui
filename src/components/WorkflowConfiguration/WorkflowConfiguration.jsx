import { useEffect, useMemo, useRef, useState } from "react";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";
import SapSystemSelector from "../SapSystemSelector/SapSystemSelector";
import MaskingDataTable from "../MaskingDataTable/MaskingDataTable";

export default function WorkflowConfiguration({
   steps = [],
   workflowValues = {},
   sapSelection,
   onSapSelectionChange,
   onInputChange,
   onSubmit,
   loading = false,
   submitted = false,
}) {
   const requiredSteps = useMemo(
      () => steps.filter((step) => step.requiresInput && !step.fieldsReadOnly),
      [steps]
   );
   const [validationMessage, setValidationMessage] = useState({});
   const [validationAttempted, setValidationAttempted] = useState(false);
   const submittedSuccessRef = useRef(null);

   useEffect(() => {
      if (!submitted) return;

      const timer = setTimeout(() => {
         submittedSuccessRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
         });
      }, 120);

      return () => clearTimeout(timer);
   }, [submitted]);

   const validate = () => {
      const missingByStep = {};
      // Validate required input fields
      requiredSteps.forEach((step) => {
         const values = workflowValues?.[step.id] || {};
         (step.fields || []).forEach((field) => {
            let value;
            // If the field exists in workflowValues, use that value
            // even when it is an empty string.
            if (Object.prototype.hasOwnProperty.call(values, field.name)) {
               value = values[field.name];
            } else {
               // Field has never been changed, so use defaultValue.
               value = field.defaultValue;
            }
            if (
               field.required &&
               !String(value ?? "").trim()
            ) {
               if (!missingByStep[step.name]) {
                  missingByStep[step.name] = [];
               }
               missingByStep[step.name].push(field.label);
            }
         });
      });

      // Validate Source SAP
      if (!sapSelection?.sourceLandscape || !sapSelection?.source) {
         if (!missingByStep["Select SAP Systems"]) {
            missingByStep["Select SAP Systems"] = [];
         }
         missingByStep["Select SAP Systems"].push(
            "Source SAP system"
         );
      }

      // Validate Target SAP
      if (!sapSelection?.targetLandscape || !sapSelection?.target) {
         if (!missingByStep["Select SAP Systems"]) {
            missingByStep["Select SAP Systems"] = [];
         }
         missingByStep["Select SAP Systems"].push(
            "Target SAP system"
         );
      }
      const hasMissingFields = Object.keys(missingByStep).length > 0;
      if (hasMissingFields) {
         setValidationMessage(missingByStep);
         return false;
      }
      setValidationMessage([]);
      return true;
   };

   const handleSubmit = () => {
      if (submitted || loading) return;
      setValidationAttempted(true);
      if (!validate()) return;
      onSubmit?.();
   };

   return (
      <div className="mt-4 space-y-4">
         <div className="px-1">
            <div className="font-bold text-gray-900 text-sm tracking-tight">Configure test data</div>
            <div className="text-xs text-gray-500 mt-0.5">
               Provide the required information and select the SAP source and target systems. Submit when ready.
            </div>
         </div>

         {steps.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                     Process steps
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mt-0.5">
                     Selected test steps
                  </div>
               </div>

               <div className="p-4 space-y-2">
                  {steps.map((step, index) => (
                     <div
                        key={step.id}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${submitted
                           ? "border-gray-200 bg-gray-50 text-gray-500"
                           : "border-brand-100 bg-brand-50/40 text-gray-700"
                           }`}
                     >
                        <span
                           className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${submitted
                              ? "bg-gray-200 text-gray-500"
                              : "bg-brand-100 text-brand-600"
                              }`}
                        >
                           {index + 1}
                        </span>

                        <span className="text-sm flex-1">
                           {step.name}
                        </span>

                        <span className="text-xs font-semibold text-gray-400">
                           {submitted ? "Submitted" : "Selected"}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         )}

         <SapSystemSelector
            disabled={loading || submitted}
            hideConfirmButton={true}
            value={sapSelection}
            onChange={onSapSelectionChange}
         />

          {requiredSteps.map((step) => (
            <div key={step.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
               {/* <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Required information</div>
                  <div className="font-semibold text-sm text-gray-900 mt-0.5">{step.name}</div>
               </div> */}
               <div className="p-4">
                  <DynamicStepForm
                     step={step}
                     initialValues={workflowValues?.[step.id] || {}}
                     hideSubmit={true}
                     loading={loading || submitted}
                     disabled={loading || submitted}
                     submitted={submitted}
                     highlightRequired={validationAttempted}
                     onValuesChange={(values) => onInputChange?.(step.id, values)}
                     sapSelection={sapSelection}
                  />
               </div>
            </div>
         ))}

         {Object.keys(validationMessage).length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">

               {/* Header */}
               <div className="flex items-center gap-2 text-red-800 font-semibold text-sm mb-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 font-bold">
                     !
                  </span>

                  <span>
                     Please complete the required information before submitting -
                  </span>
               </div>

               {/* Grouped validation messages */}
               <div className="space-y-4 ml-9">
                  {Object.entries(validationMessage).map(
                     ([stepName, fields]) => (
                        <div key={stepName}>
                           {/* Step / Section name */}
                           <div className="font-semibold text-red-800 text-sm mb-1.5">
                              {stepName}
                           </div>
                           {/* Missing fields */}
                           <ul className="space-y-1.5 ml-3">
                              {fields.map((field) => (
                                 <li
                                    key={field}
                                    className="flex items-center gap-2 text-sm text-red-700"
                                 >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span>{field}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )
                  )}
               </div>
            </div>
         )}

         {!submitted && (
            <div className="flex justify-end pt-1">
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
               >
                  {loading ? "Processing…" : "Submit workflow"}
                  {!loading && <span>✓</span>}
               </button>
            </div>
         )}

         {submitted && (
            <div className="space-y-3 pt-1">
               <div ref={submittedSuccessRef} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">✓</div>
                  <div>
                     <div className="font-semibold text-emerald-800">Workflow submitted successfully</div>
                     <div className="text-xs text-emerald-600 mt-0.5">You can now review and configure the masking data below.</div>
                  </div>
               </div>
               <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-brand-200 bg-brand-50 text-sm text-brand-700 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">✓</div>
                  <div>
                     <div className="font-semibold text-brand-800">Review masking configuration</div>
                     <div className="text-xs text-brand-600 mt-0.5">Configure data masking before generating synthetic records.</div>
                  </div>
               </div>
               <MaskingDataTable />
            </div>
         )}
      </div>
   );
}
