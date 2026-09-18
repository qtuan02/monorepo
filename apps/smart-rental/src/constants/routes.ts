/**
 * The one route table. Every `<Route path>`, `<Link to>` and `navigate(...)`
 * reads from here — a literal path string anywhere else drifts the moment a
 * route is renamed (see .agents/rules/routing-constants.md).
 *
 * Copied from the prototype's `routes` + `routePathBuilders`, minus the
 * `<segment>/*` splats (no route ever nested under them) and the
 * `isImplemented` manifest (every entry is implemented). `as const` keeps each
 * value a literal type, so a typo fails to compile rather than resolving to a
 * 404 at runtime.
 */
export const ROUTES = {
  HOME: "/",
  AUTH_LOGIN: "/auth/login",

  BUILDINGS: "/buildings",
  BUILDING_DETAIL: "/buildings/:buildingId",

  ROOMS: "/rooms",
  ROOM_DETAIL: "/rooms/:roomId",

  TENANTS: "/tenants",
  TENANT_DETAIL: "/tenants/:tenantId",

  CONTRACTS: "/contracts",
  CONTRACT_CREATE: "/contracts/create",
  CONTRACT_DETAIL: "/contracts/:contractId",
  CONTRACT_RENEW: "/contracts/:contractId/renew",
  CONTRACT_LIQUIDATION: "/contracts/:contractId/liquidation",

  INVOICES: "/invoices",
  INVOICE_DETAIL: "/invoices/:invoiceId",

  /** "Kỳ điện nước & hoá đơn" (ADR-0013) — one Toà nhà, one Kỳ; replaces INVOICE_BATCH + METER_INPUT. */
  CYCLE_DETAIL: "/cycles/:month",

  UTILITIES: "/utilities",
  UTILITY_DETAIL: "/utilities/:utilityId",

  SUPPLIER_BILLS: "/supplier-bills",
  SUPPLIER_BILL_DETAIL: "/supplier-bills/:billId",

  EXPENSES: "/expenses",
  EXPENSE_DETAIL: "/expenses/:expenseId",

  RECONCILIATION: "/reconciliation",
  REPORTS: "/reports",
  COMPLIANCE: "/compliance",
  COMMUNICATIONS: "/communications",
  SETTINGS: "/settings",

  /**
   * Builders for the dynamic segments: each `:param` placeholder lives in exactly
   * one place (the template above), and no caller interpolates a path by hand.
   */
  buildingDetailPath: (buildingId: string) => `/buildings/${buildingId}`,
  roomDetailPath: (roomId: string) => `/rooms/${roomId}`,
  tenantDetailPath: (tenantId: string) => `/tenants/${tenantId}`,
  contractDetailPath: (contractId: string) => `/contracts/${contractId}`,
  contractRenewPath: (contractId: string) => `/contracts/${contractId}/renew`,
  contractLiquidationPath: (contractId: string) =>
    `/contracts/${contractId}/liquidation`,
  invoiceDetailPath: (invoiceId: string) => `/invoices/${invoiceId}`,
  /** `month` is `YYYY-MM`. */
  cycleDetailPath: (month: string) => `/cycles/${month}`,
  utilityDetailPath: (utilityId: string) => `/utilities/${utilityId}`,
  supplierBillDetailPath: (billId: string) => `/supplier-bills/${billId}`,
  expenseDetailPath: (expenseId: string) => `/expenses/${expenseId}`,
} as const;
