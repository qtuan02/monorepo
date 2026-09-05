import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import dayjs from "@monorepo/dayjs";
import {
  FULL_DATE_FORMAT,
  TIME_WITH_SECONDS_FORMAT,
} from "@monorepo/dayjs/formats";
import { defaultLanguage } from "@monorepo/i18n/languages";

/**
 * A self-ticking clock, kept out of HeaderTemplate so the second-by-second
 * re-render stays scoped to this component instead of the whole header.
 *
 * It is also the shell's worked example of what a server-rendered Runtime may
 * not do. The Vite Template seeds this from `Date.now()` during the first
 * render, which is correct there and a guaranteed hydration mismatch here: the
 * server renders at its instant, the browser hydrates at a later one, and React
 * discards the whole subtree over a seconds digit. So the clock renders nothing
 * until it has mounted in a browser — a value that cannot be the same on both
 * sides simply is not part of the first HTML.
 */
export default function HeaderClock() {
  // `null` until mounted, and a timestamp rather than a dayjs instance after
  // that: an instance freezes the locale it was built with, so it would keep
  // rendering the old weekday. Building it during render keeps the output a
  // function of the two values below.
  const [now, setNow] = useState<number | null>(null);
  const { i18n } = useTranslation();

  // A genuine external-system sync: the wall clock lives outside React. The
  // first `setNow` is what ends the server-safe empty render, so it doubles as
  // the mount signal and no separate `mounted` flag is needed.
  useEffect(() => {
    setNow(Date.now());

    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return null;
  }

  /*
   * The active locale is global state inside dayjs that React cannot see, so
   * `.locale()` threads the language in as a real render input. Relying on the
   * ~/libs/dayjs bridge alone leaves the React Compiler free to memoize this on
   * `now` and keep painting the old weekday after a switch — and on the server
   * that bridge is per process rather than per request, so it would be wrong
   * there for a second reason.
   *
   * `resolvedLanguage`, not `language`: dayjs only has the registry's locales
   * loaded, and `.locale("vi-VN")` for one it never imported is a silent no-op
   * that leaves the previous language on screen.
   */
  const current = dayjs(now).locale(i18n.resolvedLanguage ?? defaultLanguage);

  return (
    <div className="hidden items-center gap-2.5 md:flex">
      <span className="text-base leading-none font-semibold tabular-nums">
        {current.format(TIME_WITH_SECONDS_FORMAT)}
      </span>
      <span aria-hidden="true" className="bg-primary-foreground/25 h-4 w-px" />
      <span className="text-primary-foreground/85 text-xs leading-none first-letter:uppercase">
        {current.format(FULL_DATE_FORMAT)}
      </span>
    </div>
  );
}
