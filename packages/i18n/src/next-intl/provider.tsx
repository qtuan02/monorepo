"use client";

import type { ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";

import type { LanguageCode } from "../languages";

type ProviderProps = ComponentProps<typeof NextIntlClientProvider>;

export interface I18nProviderProps extends Omit<ProviderProps, "locale"> {
  /**
   * Omit it inside the App Router: rendered from a Server Component the
   * provider inherits locale, messages, formats and time zone from the request
   * config. Pass it where there is no request — a test, a Storybook story.
   */
  locale?: LanguageCode;
}

/**
 * The client boundary for a Next Runtime.
 *
 * It exists so `locale` is constrained to the registry, and so an app that
 * needs `onError` / `getMessageFallback` has somewhere to put them: those are
 * functions, and Next refuses to serialize a function across the server/client
 * boundary, so they can only be set from inside a `"use client"` module.
 */
export function I18nProvider({ locale, ...props }: I18nProviderProps) {
  return <NextIntlClientProvider locale={locale} {...props} />;
}
