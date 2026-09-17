// Derived from hooks-ts mocks.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: one `createStorageMock` factory typed as `Storage` (adds `length`/`key`, `?? null`) instead of two IIFEs; no `window` side effect at module scope — a spec installs the mock itself
export const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

export const localStorageMock = createStorageMock();
export const sessionStorageMock = createStorageMock();
