import axiosClient from "../../api/axiosClient";
import API_ENDPOINTS from "../../api/apiEndpoints";
import { mockVectorSearchResponse } from "../../mock/scenarioResponse/scenarioResponse";

const USE_MOCK_API =
  String(import.meta.env.VITE_USE_MOCK_API ?? "true").toLowerCase() === "true";

/**
 * Identify matching business scenarios.
 *
 * Backend contract:
 * GET /scenarios/identify?userInput=<business requirement>
 *
 * Mock mode is enabled by default so the application continues to work
 * before the backend is deployed.
 */
export async function searchScenarios(userInput) {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockVectorSearchResponse(userInput);
  }

  const response = await axiosClient.get(API_ENDPOINTS.scenarios.identify, {
    params: {
      userInput,
    },
  });

  return response.data;
}

/**
 * Optional normalizer for small backend contract differences.
 * The UI can consume:
 * { query, matches: [...] }
 */
export function normalizeScenarioSearchResponse(data, query = "") {
  if (Array.isArray(data)) {
    return {
      query,
      matches: data,
    };
  }

  return {
    query: data?.query ?? data?.userInput ?? query,
    matches:
      data?.matches ??
      data?.scenarios ??
      data?.results ??
      data?.data ??
      [],
  };
}
