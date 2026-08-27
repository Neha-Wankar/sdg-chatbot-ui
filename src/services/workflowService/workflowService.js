import { mockProcessStep } from "../../mock/workflowResponse/workflowResponse";

const USE_MOCK_API = String(import.meta.env.VITE_USE_MOCK_API ?? "true").toLowerCase() === "true";

export async function processStep({ scenarioId, stepId, inputs }) {
  if (USE_MOCK_API) {
    return mockProcessStep({ scenarioId, stepId, inputs });
  }

  // TODO: replace with real API call
  throw new Error("Real workflow API not yet implemented.");
}
