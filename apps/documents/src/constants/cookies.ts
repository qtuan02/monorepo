/**
 * The language cookie i18next writes when a visitor switches language. Named
 * per app, not per Template: two apps served from one domain would otherwise
 * share this value and fight over it, so a clone must rename it the same moment
 * it is generated (`apps/portfolio` spells its own `portfolio_lang`).
 */
export const LANGUAGE_COOKIE_NAME = "documents_lang";
