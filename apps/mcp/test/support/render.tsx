import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react";

import { defaultLanguage, messages } from "@monorepo/i18n/languages";
import { I18nProvider } from "@monorepo/i18n/next-intl/provider";

/**
 * A fresh client per render, with retries off: a test asserting the error branch
 * would otherwise wait out a retry before the branch ever appears.
 */
function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
}

/**
 * The two providers a component under test sees in the real app. The locale is
 * pinned to the registry default (`vi`) with the real catalogues, so `t("…")`
 * resolves to the string a user reads — and the same assertion holds on every
 * machine, which a locale detected from `navigator.language` would not.
 */
function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider locale={defaultLanguage} messages={messages[defaultLanguage]}>
      <QueryClientProvider client={makeTestQueryClient()}>
        {children}
      </QueryClientProvider>
    </I18nProvider>
  );
}

/** Drop-in replacement for RTL's `render` — same return value, wrapped tree. */
export function render(ui: ReactElement) {
  return rtlRender(ui, { wrapper: Providers });
}
