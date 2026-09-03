import type { Locale } from "next-intl";

export type NextParams<
  TParams extends Record<string, string | undefined> = Record<string, never>,
> = Promise<WithLocale<TParams>>;

export type NextSearchParams<
  TSearchParams extends Record<string, SearchParamsValue> = Record<
    string,
    never
  >,
> = Promise<WithSearchParams<TSearchParams>>;

export interface BaseParams {
  locale: Locale;
}

export type SearchParamsValue = string | string[] | undefined;

export type BaseSearchParams = Record<string, SearchParamsValue>;

export type WithLocale<
  T extends Record<string, string | undefined> = Record<string, never>,
> = BaseParams & T;

export type WithSearchParams<
  T extends Record<string, SearchParamsValue> = Record<string, never>,
> = BaseSearchParams & T;

// For define split component props
export type TParams<T extends Record<string, string | undefined>> =
  WithLocale<T>;

// For define split component props
export type TSearchParams<
  T extends Record<string, string | string[] | undefined>,
> = WithSearchParams<T>;
