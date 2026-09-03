export const API_ENDPOINTS = {
  auth: {
    login: "/login",
  },

  scenarios: {
    identify: "/scenarios/identify",
  },

  workflow: {
    processSteps: "/scenarios/process-steps",
    processStep: "/workflows/steps/process",
    submit: "/workflows/submit",
  },

  sap: {
    systems: "/sap/systems",
  },
};

export default API_ENDPOINTS;
