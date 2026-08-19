import axiosClient from "../../api/axiosClient";
import { mockVectorSearchResponse } from "../../mock/scenarioResponse/scenarioResponse";

const USE_MOCK_API = String(import.meta.env.VITE_USE_MOCK_API ?? "true").toLowerCase() === "true";
const API_URL = import.meta.env.VITE_SCENARIO_API_URL || "/api/v1/sap/parse-nlp";

export async function searchScenarios(query) {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockVectorSearchResponse(query);
  }

  const response = await axiosClient.post(API_URL, { query });
  return response.data;
}
