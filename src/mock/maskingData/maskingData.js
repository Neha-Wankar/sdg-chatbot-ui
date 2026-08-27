// ── Masking configuration ────────────────────────────────────────────────────

export const MASK_PROVIDERS = ["SAP_CODE", "CITY", "HASH", "FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE", "DATE", "none"];

export const DEFAULT_MASKING_ROWS = [
  { id: 1,  column: "to_Item[0].StorageLocation",      maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 2,  column: "IncotermsLocation1",               maskProvider: "CITY",     source: "name_rule"     },
  { id: 3,  column: "to_Item[0].RequestedQuantityUnit", maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 4,  column: "OrganizationDivision",             maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 5,  column: "to_Item[0].Material",              maskProvider: "HASH",     source: "none"          },
  { id: 6,  column: "DistributionChannel",              maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 7,  column: "SalesOrganization",                maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 8,  column: "to_Item[0].RequestedQuantity",     maskProvider: "SAP_CODE", source: "sap_code_rule" },
  { id: 9,  column: "SoldToParty",                      maskProvider: "SAP_CODE", source: "dpt"           },
  { id: 10, column: "to_Item[0].ProductionPlant",       maskProvider: "SAP_CODE", source: "sap_code_rule" },
];

export const MASKING_COLUMNS = [
  { key: "column",       label: "Column",           sortable: true },
  { key: "maskProvider", label: "Masking provider", sortable: true },
  { key: "source",       label: "Source",           sortable: true },
];

export const PROVIDER_COLORS = {
  SAP_CODE:   "bg-blue-50 text-blue-700 border-blue-200",
  CITY:       "bg-violet-50 text-violet-700 border-violet-200",
  HASH:       "bg-slate-50 text-slate-600 border-slate-200",
  FIRST_NAME: "bg-pink-50 text-pink-700 border-pink-200",
  LAST_NAME:  "bg-rose-50 text-rose-700 border-rose-200",
  EMAIL:      "bg-amber-50 text-amber-700 border-amber-200",
  PHONE:      "bg-teal-50 text-teal-700 border-teal-200",
  DATE:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  none:       "bg-gray-50 text-gray-500 border-gray-200",
};

// ── Preview table columns ─────────────────────────────────────────────────────

export const PREVIEW_COLUMNS = [
  { key: "SalesOrderType",                  label: "SalesOrderType",                   sortable: true },
  { key: "DistributionChannel",             label: "DistributionChannel",              sortable: true },
  { key: "SoldToParty",                     label: "SoldToParty",                      sortable: true },
  { key: "IncotermsLocation1",              label: "IncotermsLocation1",               sortable: true },
  { key: "to_Item_Material",                label: "to_Item[0].Material",              sortable: true },
  { key: "to_Item_RequestedQuantity",       label: "to_Item[0].RequestedQuantity",     sortable: true },
  { key: "to_Item_RequestedQuantityUnit",   label: "to_Item[0].RequestedQuantityUnit", sortable: true },
  { key: "SalesOrganization",               label: "SalesOrganization",                sortable: true },
  { key: "OrganizationDivision",            label: "OrganizationDivision",             sortable: true },
  { key: "IncotermsLocation2",              label: "IncotermsLocation2",               sortable: true },
  { key: "to_Item_ProductionPlant",         label: "to_Item[0].ProductionPlant",       sortable: true },
  { key: "to_Item_StorageLocation",         label: "to_Item[0].StorageLocation",       sortable: true },
  { key: "to_Item_Batch",                   label: "to_Item[0].Batch",                 sortable: true },
  { key: "CustomerPaymentTerms",            label: "CustomerPaymentTerms",             sortable: true },
];

// ── Preview row seed data ─────────────────────────────────────────────────────

// Deterministic-looking fake hashes / masked values
export const HASHES = [
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "72124095A2093\nA1C4D40F354C\n1CFF411",
  "2120323E19714\n2E1EE92D0F4\nE3652D3F",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "186322E14F1BD\n3C5DE5473608\n02B73C1",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "186322E14F1BD\n3C5DE5473608\n02B73C1",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "5A4347DF60181\nE3010DB0578C\n828CC17E",
  "B391EE17BB60\n7903043\n85AFD9B60443",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "091E2A681223\nE3010DB0578C\n828CC17E",
  "DBBFAEB469\nECFE7936B8\n85AFD9B60443",
  "85AFD9B60443\nE3010DB0578C\n828CC17E",
  "091E2A681223\nDBBFAEB469\nECFE7936B8",
  "85AFD9B60443\nE3010DB0578C\n828C",
];

export const QTYS = [35.442802,49.546396,19.975629,5.955925,79.424372,7.965763,6.318231,10.107147,34.771812,94.977434,18.532907,22.823695,3.097786,1.852907,27.514408,45.110959,2.719074];
export const SOLD_TO = ["UGEP","UGEP","UGEP","TRICESIMO","TRICESIMO","UGEP","UGEP","UGEP","UGEP","UGEP","UGEP","UGEP","UGEP","UGEP","UGEP","TRICESIMO","UGEP","TRICESIMO"];
export const UNITS = ["PC","PC","PC","PC","PC","EA","PC","PC","PC","PC","PC","PC","PC","PC","PC","PC","EA","PC"];

// ── Synthetic row seed data ───────────────────────────────────────────────────

export const SYNTHETIC_MATERIALS = [
  "MAT-000123","MAT-000456","MAT-000789","MAT-001234","MAT-005678",
  "MAT-009876","MAT-003456","MAT-007890","MAT-002345","MAT-006789",
];
export const SYNTHETIC_LOCATIONS = ["UGEP","TRICESIMO","BERLIN","PARIS","LONDON","MADRID","ROME","OSLO","VIENNA","WARSAW"];
export const SYNTHETIC_BATCHES   = ["BATCH-001","BATCH-002","BATCH-003","","BATCH-004","","BATCH-005","BATCH-006","","BATCH-007"];

// ── Record count bounds ───────────────────────────────────────────────────────

export const MIN_RECORDS = 1000;
export const MAX_RECORDS = 100000;
