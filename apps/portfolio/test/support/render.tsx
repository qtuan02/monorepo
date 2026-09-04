import type { ReactElement, ReactNode } from "react";
import { render as rtlRender } from "@testing-library/react";

import { defaultLanguage, messages } from "@monorepo/i18n/languages";
import { I18nProvider } from "@monorepo/i18n/next-intl/provider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * The one provider a component under test sees in the real app. The locale is
 * pinned to the registry default (`vi`) with the real catalogues, so `t("…")`
 * resolves to the string a user reads — and the same assertion holds on every
 * machine, which a locale detected from `navigator.language` would not.
 *
 * There is no query client here: this app calls no API, so the Template's
 * `QueryProvider` was dropped along with `~/libs/query-client`.
 */
function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider locale={defaultLanguage} messages={messages[defaultLanguage]}>
      {children}
    </I18nProvider>
  );
}

/** Drop-in replacement for RTL's `render` — same return value, wrapped tree. */
export function render(ui: ReactElement) {
  return rtlRender(ui, { wrapper: Providers });
}
