import * as React from "react";
import ReactDOM from "react-dom/client";

import MainApp from "./pages/main";

import "~/libs/i18n";
import "~/libs/dayjs";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>,
  );
}
