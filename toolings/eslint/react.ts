import reactPlugin from "eslint-plugin-react";
import compilerPlugin from "eslint-plugin-react-compiler";
import hooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export const reactConfig = defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    plugins: {
      react: reactPlugin,
      "react-compiler": compilerPlugin,
      "react-hooks": hooksPlugin as any,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      // ...hooksPlugin.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
      "react/jsx-key": "error",
      "react-hooks/preserve-manual-memoization": "off",
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended?.languageOptions,
      ...reactPlugin.configs.flat["jsx-runtime"]?.languageOptions,
      globals: {
        React: "writable",
      },
    },
  },
  // hooksPlugin.configs.flat["recommended-latest"]!,
);
