/**
 * Display formats — the day-first reading these apps use. They are for what a
 * user sees; the API exchanges ISO strings, which dayjs parses and serializes on
 * its own without a format token.
 */
export const DATE_FORMAT = "DD/MM/YYYY";
/** The year on its own, where a full date would only add noise. */
export const YEAR_FORMAT = "YYYY";
export const TIME_FORMAT = "HH:mm";
export const TIME_WITH_SECONDS_FORMAT = "HH:mm:ss";
export const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

/** Weekday + date, for a readout that shows its time separately. `dddd` renders in the active locale. */
export const FULL_DATE_FORMAT = "dddd, DD/MM/YYYY";

/** Long readout for a header or detail row. `dddd` renders in the active locale. */
export const FULL_DATE_TIME_FORMAT = "dddd, DD/MM/YYYY HH:mm:ss";
