import * as React from "react";
import ReactDOM from "react-dom/client";

import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import MainApp from "./pages/main";

// No i18n in this app (see README): the locale is set once, here, and the
// prototype's `date-fns/locale/vi` formats become dayjs's `vi`.
setDayjsLocale("vi");

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>,
  );
}
