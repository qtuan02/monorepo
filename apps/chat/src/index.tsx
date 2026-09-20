import * as React from "react";
import ReactDOM from "react-dom/client";

import MainApp from "./pages/main";

import "~/libs/i18n";
import "~/libs/dayjs";

const rootEl = document.getElementById("root");

if (rootEl) {
  // The one place every boundary's catch is logged (spec #251) — an Island's
  // own ErrorBoundary or the root one both reach `onCaughtError`; anything
  // that escapes every boundary reaches `onUncaughtError` instead.
  const root = ReactDOM.createRoot(rootEl, {
    onCaughtError: (error, errorInfo) => {
      console.error("Caught render error:", error, errorInfo.componentStack);
    },
    onUncaughtError: (error, errorInfo) => {
      console.error("Uncaught render error:", error, errorInfo.componentStack);
    },
  });
  root.render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>,
  );
}
