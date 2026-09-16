/**
 * The one route table. Every `<Route path>`, `<Link to>` and `navigate(...)`
 * reads from here — a literal path string anywhere else drifts the moment a
 * route is renamed (see .agents/rules/routing-constants.md).
 *
 * `as const` keeps each value a literal type, so a typo fails to compile rather
 * than resolving to a 404 at runtime.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  DASHBOARD: "/dashboard",
  POS: "/pos",
  PATIENTS: "/patients",
  PATIENT_BY_ID: "/patients/:patientId",
  MEDICATIONS: "/medications",
  ANALYTICS: "/analytics",
  APPOINTMENTS: "/appointments",

  /**
   * Builder for a dynamic segment: the `:patientId` placeholder lives in exactly
   * one place (the template above), and no caller interpolates a path by hand.
   */
  patientByIdPath: (patientId: string) => `/patients/${patientId}`,
} as const;
