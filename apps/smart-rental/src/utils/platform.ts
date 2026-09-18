/**
 * `navigator.platform` is deprecated but still the simplest cross-browser Mac
 * check — plenty accurate for a keyboard-shortcut label (spec #179 §"IA và
 * mobile" #38). Takes the value as a param, defaulted from the live
 * `navigator`, so it stays a pure, unit-testable function rather than a hook.
 */
export function isMacPlatform(platform: string = navigator.platform): boolean {
  return /mac/i.test(platform);
}
