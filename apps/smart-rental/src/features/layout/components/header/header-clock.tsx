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
 */
export default function HeaderClock() {
  // A timestamp rather than a dayjs instance: an instance freezes the locale it
  // was built with, so it would keep rendering the old weekday. Building it
  // during render keeps the output a function of the two values below.
  const [now, setNow] = useState(() => Date.now());
  const { i18n } = useTranslation();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, []);

  /*
   * The active locale is global state inside dayjs that React cannot see, so
   * `.locale()` threads the language in as a real render input. Relying on the
   * ~/libs/dayjs bridge alone leaves the React Compiler free to memoize this on
   * `now` and keep painting the old weekday after a switch.
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
