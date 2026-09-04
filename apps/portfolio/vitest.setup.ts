import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The language pin lives in `test/support/render.tsx`, which wraps every render
// in next-intl's provider with the registry's real catalogues at `vi`. It has to
// be there rather than here: next-intl resolves its locale per React tree, not
// from a module-level singleton the way i18next does — so there is no global to
// pin from a setup file.
afterEach(() => {
  cleanup();
});
