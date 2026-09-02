const ORDER_TO_CASE_STEPS = [
  { id: "create-order", name: "Create Order (OR)", requiresInput: true, fields: [
      { name: "orderType", label: "Order Type", type: "text", required: true, defaultValue: "ZDON" },
      { name: "salesOrg", label: "Sales Organization", type: "text", required: true, defaultValue: "US50" },
      { name: "channel", label: "Distribution Channel", type: "text", required: true, defaultValue: "01" },
      { name: "division", label: "Division", type: "text", required: true, defaultValue: "00" },
      { name: "customer", label: "Customer", type: "text", required: true },
      { name: "material", label: "Material", type: "text", required: true },
      { name: "plant", label: "Plant", type: "text", required: true },
      { name: "poNumber", label: "PO / Reference Number", type: "text", required: false },
      { name: "rdd", label: "Requested Delivery Date", type: "date", required: true, futureOnly: true }
    ] 
  },
  { id: "outbound-delivery", name: "Create outbound Delivery", requiresInput: false },
  { id: "manual-shipments", name: "Create Manual shipments", requiresInput: false },
  { id: "transfer-orders", name: "Create Transfer Orders", requiresInput: false },
  { id: "confirm-transfer-orders", name: "Confirm Transfer Orders", requiresInput: false },
  { id: "goods-issue-robd", name: "Goods Issue fo ROBD", requiresInput: false },
  { id: "billing-obds", name: "Billing for OBDs", requiresInput: false },
  { id: "shipment-cost-document", name: "Create the Shipment Cost Document", requiresInput: false },
  { id: "release-scd", name: "Transfer & Release the SCD", requiresInput: false },

   { id: "outbound-delivery_1", name: "Create outbound Delivery test", requiresInput: false },
  { id: "manual-shipments_1", name: "Create Manual shipments test", requiresInput: false },
  { id: "transfer-orders_1", name: "Create Transfer Orders test", requiresInput: false },
  { id: "confirm-transfer-orders_1", name: "Confirm Transfer Orders test", requiresInput: false },
];

// Scenario-specific dummy data. Replace this object with the backend response
// when the scenario/process-step API is available.
export const PROCESS_STEPS_BY_SCENARIO = {
  "PH-E2O": ORDER_TO_CASE_STEPS,
  "AOA-ART": ORDER_TO_CASE_STEPS,
  "PH-STANDARD": ORDER_TO_CASE_STEPS,
};

// Kept for compatibility with existing imports.
export const DEFAULT_STEPS = ORDER_TO_CASE_STEPS;

export const mockScenarios = [
  {
    id: "PH-E2O",
    name: "E2E_AOA_PH_Order to Case _Standard_E2O",
    description: "Order to Case standard E2O business process.",
    steps: PROCESS_STEPS_BY_SCENARIO["PH-E2O"],
  },
  {
    id: "AOA-ART",
    name: "E2E_AOA_Order to Case _Standard_ART",
    description: "Order to Case standard ART business process.",
    steps: PROCESS_STEPS_BY_SCENARIO["AOA-ART"],
  },
  {
    id: "PH-STANDARD",
    name: "E2E_AOA_PH_Order to Case _Standard",
    description: "Order to Case standard business process.",
    steps: PROCESS_STEPS_BY_SCENARIO["PH-STANDARD"],
  },
];

export const mockVectorSearchResponse = (query = "") => ({
  query,
  matches: mockScenarios.map((scenario, index) => ({
    ...scenario,
    confidence: Number((0.96 - index * 0.04).toFixed(2)),
  })),
});

export default mockVectorSearchResponse;
