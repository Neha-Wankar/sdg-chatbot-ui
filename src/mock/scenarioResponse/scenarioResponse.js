export const DEFAULT_STEPS = [
  {
    id: "sales-order",
    name: "Create Donation sales order",
    requiresInput: true,
    fields: [
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
  {
    id: "credit-check",
    name: "Perform credit check and release credit block - If relevant else ignore the step",
    requiresInput: false
  },
  { id: "zw-partner", name: "Validate ZW partner in the order", requiresInput: false },
  { id: "availability", name: "Perform availability check", requiresInput: false },
  {
    id: "otr",
    name: "Validate sales order in OTR",
    requiresInput: true,
    fieldsReadOnly: true,
    fields: [
      { name: "salesOrg", label: "Sales Organization", type: "text", required: true, defaultValue: "US50" },
      { name: "channel", label: "Distribution Channel", type: "text", required: true, defaultValue: "01" },
      { name: "division", label: "Division", type: "text", required: true, defaultValue: "00" },
      { name: "orderType", label: "Order Type", type: "text", required: true, defaultValue: "ZDON" },
      { name: "orderNumber", label: "Order Number", type: "text", required: false, defaultValue: "1001" },
      { name: "orderDate", label: "Order Creation Date or Requested Delivery Date", type: "date", required: false, defaultValue: "2026-08-27" }
    ]
  },
  {
    id: "resolution-cockpit",
    name: "Review exceptions in Resolution Cockpit",
    requiresInput: true,
    fieldsReadOnly: true,
    fields: [
      { name: "salesOrg", label: "Sales Organization", type: "text", required: true, defaultValue: "US50" },
      { name: "channel", label: "Distribution Channel", type: "text", required: true, defaultValue: "01" },
      { name: "division", label: "Division", type: "text", required: true, defaultValue: "00" },
      { name: "orderType", label: "Order Type", type: "text", required: true, defaultValue: "OR" },
      { name: "orderNumber", label: "Order Number", type: "text", required: false, defaultValue: "2001" },
      { name: "orderDate", label: "Order Creation Date or Requested Delivery Date", type: "date", required: false, defaultValue: "2026-08-27" }
    ]
  },
  { id: "transportation", name: "Validate outputs and transportation details", requiresInput: false },
  { id: "freight-order", name: "Create freight order", requiresInput: false },
  { id: "delivery", name: "Create Delivery", requiresInput: false },
  { id: "delivery-note", name: "Validate delivery note", requiresInput: false },
  { id: "trd0", name: "Validate TRD0 output", requiresInput: false },
  { id: "shipment", name: "Create shipment document", requiresInput: false },
  { id: "warehouse", name: "Request warehouse team for picking, packing, and goods issue", requiresInput: false },
  { id: "departure", name: "Validate departure event posting", requiresInput: false },
  { id: "freight-settlement", name: "Create freight settlement document", requiresInput: false },
  { id: "shipment-cost", name: "Create shipment cost document", requiresInput: false },
  { id: "billing", name: "Create billing document and validate pricing", requiresInput: false },
  { id: "billing-output", name: "Validate billing output", requiresInput: false },
  { id: "otr-report", name: "Generate OTR report", requiresInput: false },
  { id: "fi", name: "Validate FI postings", requiresInput: false },
  { id: "ar", name: "Validate AR postings and sign-off", requiresInput: false }
];

const base = (id, name, description) => ({ id, name, description, steps: DEFAULT_STEPS });

export const mockScenarios = [
  base("DON-VA01", "E2Ev Order To Cash > Standard O2C > Donations -- via VA01", "Donation order processing using VA01."),
  base("STD-VA01", "E2Ev Order To Cash > Standard O2C > Standard -- via VA01", "Standard order processing using VA01."),
  base("RET-VA01", "E2Ev Order To Cash > Standard O2C > Returns -- via VA01", "Returns order processing using VA01.")
];

export const mockVectorSearchResponse = (query = "") => ({
  query,
  matches: mockScenarios.map((item, index) => ({ ...item, confidence: Number((0.96 - index * 0.04).toFixed(2)) }))
});

export default mockVectorSearchResponse;
