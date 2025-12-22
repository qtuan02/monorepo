#!/usr/bin/env node
/**
 * Generate Documentation Metadata
 *
 * This script scans the monorepo packages and generates metadata JSON files
 * for the documentation site. It extracts:
 * - Component/Hook names and file paths
 * - Source code content
 * - Props/Parameters from TypeScript types (using ts-morph)
 * - Basic category detection
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  BindingElement,
  FunctionDeclaration,
  ParameterDeclaration,
  SourceFile,
} from "ts-morph";
import { Project, SyntaxKind } from "ts-morph";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.resolve(__dirname, "../../..");
const UI_COMPONENTS_DIR = path.join(ROOT_DIR, "packages/ui/src/components");
const HOOKS_DIR = path.join(ROOT_DIR, "packages/hook/src/hooks");
const OUTPUT_DIR = path.join(__dirname, "../src/generated");

// Types
interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

interface ComponentMetadata {
  id: string;
  name: string;
  description: string | null;
  category: string;
  package: "ui";
  filePath: string;
  props: ComponentProp[];
  sourceCode: string;
  examples?: string[];
  tags?: string[];
}

interface HookParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

interface HookReturn {
  type: string;
  description?: string;
}

interface HookMetadata {
  id: string;
  name: string;
  description: string | null;
  category: string;
  package: "hook";
  filePath: string;
  parameters: HookParameter[];
  returns: HookReturn;
  sourceCode: string;
  examples?: string[];
}

// Category detection based on component name patterns
const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  Form: [
    /button/i,
    /input/i,
    /select/i,
    /checkbox/i,
    /radio/i,
    /switch/i,
    /textarea/i,
    /label/i,
    /form/i,
    /slider/i,
    /toggle/i,
  ],
  Feedback: [
    /dialog/i,
    /alert/i,
    /toast/i,
    /sonner/i,
    /drawer/i,
    /sheet/i,
    /popover/i,
    /tooltip/i,
    /hover-card/i,
  ],
  "Data Display": [
    /table/i,
    /card/i,
    /badge/i,
    /avatar/i,
    /calendar/i,
    /progress/i,
    /skeleton/i,
  ],
  Navigation: [
    /tab/i,
    /navigation/i,
    /menu/i,
    /breadcrumb/i,
    /pagination/i,
    /command/i,
  ],
  Layout: [
    /accordion/i,
    /collapsible/i,
    /resizable/i,
    /scroll/i,
    /separator/i,
    /aspect-ratio/i,
  ],
};

const HOOK_CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  "Client-side": [/use-is-client/i, /use-is-mobile/i, /use-media/i],
  Utilities: [
    /use-debounce/i,
    /use-throttle/i,
    /use-timeout/i,
    /use-countdown/i,
    /use-local-storage/i,
    /use-copy/i,
  ],
};

function detectCategory(
  name: string,
  patterns: Record<string, RegExp[]>,
): string {
  for (const [category, regexes] of Object.entries(patterns)) {
    if (regexes.some((regex) => regex.test(name))) {
      return category;
    }
  }
  return "Uncategorized";
}

function kebabToPascalCase(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getComponentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
    .filter((file) => !file.startsWith("index"))
    .map((file) => path.join(dir, file));
}

function getHookFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".ts"))
    .filter((file) => !file.startsWith("index"))
    .map((file) => path.join(dir, file));
}

// Initialize ts-morph project
const project = new Project({
  compilerOptions: {
    allowJs: true,
    jsx: 4, // JsxEmit.ReactJSX
  },
  skipAddingFilesFromTsConfig: true,
});

/**
 * Extract default value from a binding element in destructuring pattern
 */
function getDefaultValue(element: BindingElement): string | undefined {
  const initializer = element.getInitializer();
  if (initializer) {
    return initializer.getText();
  }
  return undefined;
}

/**
 * Extract props from a function's destructured parameter
 * Handles patterns like: function Button({ className, variant, size, asChild = false, ...props })
 */
function extractPropsFromDestructuring(
  param: ParameterDeclaration,
): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Get the binding pattern (destructured props)
  const bindingPattern = param.getNameNode();
  if (
    !bindingPattern ||
    bindingPattern.getKind() !== SyntaxKind.ObjectBindingPattern
  ) {
    return props;
  }

  // Get the type of the parameter
  const paramType = param.getType();
  const typeProperties = paramType.getProperties();

  // Create a map of property names to their types
  const propertyTypes = new Map<string, { type: string; required: boolean }>();
  for (const prop of typeProperties) {
    const propName = prop.getName();
    const propType = prop.getTypeAtLocation(param);
    const propDeclarations = prop.getDeclarations();

    // Check if optional (has ? modifier or is from intersection with optional)
    let isOptional = false;
    if (propDeclarations.length > 0) {
      const decl = propDeclarations[0];
      if (decl && "hasQuestionToken" in decl) {
        isOptional = (
          decl as { hasQuestionToken: () => boolean }
        ).hasQuestionToken();
      }
    }
    // Also check if type includes undefined
    if (!isOptional) {
      isOptional =
        propType.isNullable() || propType.getText().includes("undefined");
    }

    propertyTypes.set(propName, {
      type: formatTypeText(propType.getText()),
      required: !isOptional,
    });
  }

  // Get the actual destructured elements to find default values
  const elements =
    bindingPattern.asKind(SyntaxKind.ObjectBindingPattern)?.getElements() || [];

  for (const element of elements) {
    const propName = element.getName();

    // Skip ...props spread
    if (element.getDotDotDotToken()) {
      continue;
    }

    // Get type info from our map
    const typeInfo = propertyTypes.get(propName);
    const defaultValue = getDefaultValue(element);

    props.push({
      name: propName,
      type: typeInfo?.type || "unknown",
      required: defaultValue ? false : (typeInfo?.required ?? false),
      defaultValue,
    });
  }

  return props;
}

/**
 * Format complex TypeScript type text for better readability
 */
function formatTypeText(typeText: string): string {
  // Remove import(...) statements for cleaner display
  let formatted = typeText.replace(/import\([^)]+\)\./g, "");

  // Simplify React types
  formatted = formatted.replace(/React\.ReactNode/g, "ReactNode");
  formatted = formatted.replace(/React\.ReactElement/g, "ReactElement");
  formatted = formatted.replace(/React\.CSSProperties/g, "CSSProperties");
  formatted = formatted.replace(/React\.MouseEvent<[^>]+>/g, "MouseEvent");
  formatted = formatted.replace(/React\.ChangeEvent<[^>]+>/g, "ChangeEvent");

  // Truncate if too long
  if (formatted.length > 100) {
    formatted = formatted.substring(0, 97) + "...";
  }

  return formatted;
}

/**
 * Find the main exported component function in a source file
 * Returns the first exported function that matches the component name pattern
 */
function findMainComponentFunction(
  sourceFile: SourceFile,
  componentName: string,
): FunctionDeclaration | undefined {
  // First try to find exact match
  const exactMatch = sourceFile.getFunction(componentName);
  if (exactMatch && (exactMatch.isExported() || exactMatch.isDefaultExport())) {
    return exactMatch;
  }

  // Get all exported functions
  const exportedFunctions = sourceFile.getFunctions().filter((f) => {
    // Direct export
    if (f.isExported() || f.isDefaultExport()) return true;
    // Check if exported via export statement
    const name = f.getName();
    if (!name) return false;
    return sourceFile.getExportedDeclarations().has(name);
  });

  // Find the one with destructured first parameter (React component pattern)
  for (const func of exportedFunctions) {
    const params = func.getParameters();
    if (params.length > 0) {
      const firstParam = params[0];
      const nameNode = firstParam.getNameNode();
      if (nameNode && nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
        return func;
      }
    }
  }

  // Return first exported function as fallback
  return exportedFunctions[0];
}

/**
 * Extract JSDoc description from a function
 */
function extractJSDocDescription(func: FunctionDeclaration): string | null {
  const jsDocs = func.getJsDocs();
  if (jsDocs.length > 0) {
    const description = jsDocs[0].getDescription();
    if (description) {
      return description.trim();
    }
  }
  return null;
}

function extractComponentMetadata(filePath: string): ComponentMetadata | null {
  try {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    const fileName = path.basename(filePath, path.extname(filePath));
    const id = fileName;
    let name = kebabToPascalCase(fileName);
    const category = detectCategory(fileName, CATEGORY_PATTERNS);
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Parse with ts-morph
    let props: ComponentProp[] = [];
    let description: string | null = null;

    try {
      const sourceFile = project.createSourceFile(
        `temp_${Date.now()}_${fileName}.tsx`,
        sourceCode,
        { overwrite: true },
      );

      const mainFunc = findMainComponentFunction(sourceFile, name);
      if (mainFunc) {
        const funcName = mainFunc.getName();
        if (funcName) {
          name = funcName;
        }

        const params = mainFunc.getParameters();
        if (params.length > 0) {
          props = extractPropsFromDestructuring(params[0]);
        }
        description = extractJSDocDescription(mainFunc);
      }

      // Clean up temp file
      project.removeSourceFile(sourceFile);
    } catch (parseError) {
      console.warn(`   ⚠️ Could not parse props for ${name}: ${parseError}`);
    }

    return {
      id,
      name,
      description,
      category,
      package: "ui",
      filePath: relativePath,
      props,
      sourceCode,
    };
  } catch (error) {
    console.error(`Error reading component: ${filePath}`, error);
    return null;
  }
}

/**
 * Extract hook parameters and return type
 */
function extractHookDetails(
  sourceFile: SourceFile,
  hookName: string,
): {
  parameters: HookParameter[];
  returns: HookReturn;
  description: string | null;
} {
  const result: {
    parameters: HookParameter[];
    returns: HookReturn;
    description: string | null;
  } = {
    parameters: [],
    returns: { type: "unknown" },
    description: null,
  };

  // Find the hook function
  const hookFunc = sourceFile.getFunction(hookName);
  if (!hookFunc) {
    // Try to find any exported function starting with "use"
    const allFuncs = sourceFile.getFunctions();
    for (const func of allFuncs) {
      const funcName = func.getName();
      if (funcName && funcName.startsWith("use") && func.isExported()) {
        return extractHookDetailsFromFunction(func);
      }
    }
    return result;
  }

  return extractHookDetailsFromFunction(hookFunc);
}

function extractHookDetailsFromFunction(func: FunctionDeclaration): {
  parameters: HookParameter[];
  returns: HookReturn;
  description: string | null;
} {
  const parameters: HookParameter[] = [];

  // Extract parameters
  for (const param of func.getParameters()) {
    const paramName = param.getName();
    const paramType = param.getType();
    const hasQuestionToken = param.hasQuestionToken();
    const initializer = param.getInitializer();

    parameters.push({
      name: paramName,
      type: formatTypeText(paramType.getText()),
      required: !hasQuestionToken && !initializer,
      defaultValue: initializer?.getText(),
    });
  }

  // Extract return type
  const returnType = func.getReturnType();
  const returns: HookReturn = {
    type: formatTypeText(returnType.getText()),
  };

  // Extract JSDoc
  const description = extractJSDocDescription(func);

  return { parameters, returns, description };
}

function extractHookMetadata(filePath: string): HookMetadata | null {
  try {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    const fileName = path.basename(filePath, path.extname(filePath));
    const id = fileName;
    const name = kebabToPascalCase(fileName);
    const category = detectCategory(fileName, HOOK_CATEGORY_PATTERNS);
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Parse with ts-morph
    let parameters: HookParameter[] = [];
    let returns: HookReturn = { type: "unknown" };
    let description: string | null = null;

    try {
      const sourceFile = project.createSourceFile(
        `temp_hook_${Date.now()}_${fileName}.ts`,
        sourceCode,
        { overwrite: true },
      );

      const details = extractHookDetails(sourceFile, name);
      parameters = details.parameters;
      returns = details.returns;
      description = details.description;

      // Clean up temp file
      project.removeSourceFile(sourceFile);
    } catch (parseError) {
      console.warn(`   ⚠️ Could not parse hook ${name}: ${parseError}`);
    }

    return {
      id,
      name,
      description,
      category,
      package: "hook",
      filePath: relativePath,
      parameters,
      returns,
      sourceCode,
    };
  } catch (error) {
    console.error(`Error reading hook: ${filePath}`, error);
    return null;
  }
}

function generateComponentsMetadata(): ComponentMetadata[] {
  console.log("📦 Scanning UI components...");
  const files = getComponentFiles(UI_COMPONENTS_DIR);
  console.log(`   Found ${files.length} component files`);

  const components: ComponentMetadata[] = [];
  let propsExtracted = 0;

  for (const file of files) {
    const metadata = extractComponentMetadata(file);
    if (metadata) {
      components.push(metadata);
      if (metadata.props.length > 0) {
        propsExtracted++;
      }
    }
  }

  console.log(`   Extracted props from ${propsExtracted} components`);
  return components;
}

function generateHooksMetadata(): HookMetadata[] {
  console.log("🪝 Scanning hooks...");
  const files = getHookFiles(HOOKS_DIR);
  console.log(`   Found ${files.length} hook files`);

  const hooks: HookMetadata[] = [];

  for (const file of files) {
    const metadata = extractHookMetadata(file);
    if (metadata) {
      hooks.push(metadata);
    }
  }

  return hooks;
}

function writeOutput(components: ComponentMetadata[], hooks: HookMetadata[]) {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write components.json
  const componentsPath = path.join(OUTPUT_DIR, "components.json");
  fs.writeFileSync(
    componentsPath,
    JSON.stringify({ components }, null, 2),
    "utf-8",
  );
  console.log(`✅ Written: ${componentsPath}`);

  // Write hooks.json
  const hooksPath = path.join(OUTPUT_DIR, "hooks.json");
  fs.writeFileSync(hooksPath, JSON.stringify({ hooks }, null, 2), "utf-8");
  console.log(`✅ Written: ${hooksPath}`);

  // Generate Component Registry (registry.tsx)
  generateComponentRegistry(components);

  // Generate TypeScript index file
  const indexPath = path.join(OUTPUT_DIR, "index.ts");
  fs.writeFileSync(
    indexPath,
    `// Auto-generated - do not edit
import componentsData from "./components.json";
import hooksData from "./hooks.json";

export const generatedComponents = componentsData.components;
export const generatedHooks = hooksData.hooks;
`,
    "utf-8",
  );
  console.log(`✅ Written: ${indexPath}`);
}

function generateComponentRegistry(components: ComponentMetadata[]) {
  const registryPath = path.join(OUTPUT_DIR, "registry.tsx");

  const registryContent = `// Auto-generated component registry - do not edit
import { lazy, type LazyExoticComponent, type ComponentType } from "react";

export type ComponentRegistry = Record<string, LazyExoticComponent<ComponentType<any>>>;

export const componentRegistry: ComponentRegistry = {
${components
  .map((component) => {
    // Assumption: Component filename (id) matches import path
    // and PascalCase name matches the named export
    return `  "${component.id}": lazy(() => import("@monorepo/ui/components/${component.id}").then(m => ({ default: m.${component.name} }))),`;
  })
  .join("\n")}
};
`;

  fs.writeFileSync(registryPath, registryContent, "utf-8");
  console.log(`✅ Written: ${registryPath}`);
}

function main() {
  console.log("🚀 Generating documentation metadata...\n");

  const components = generateComponentsMetadata();
  const hooks = generateHooksMetadata();

  console.log(`\n📊 Summary:`);
  console.log(`   Components: ${components.length}`);
  console.log(`   Hooks: ${hooks.length}`);

  // Show sample of extracted props
  const withProps = components.filter((c) => c.props.length > 0);
  if (withProps.length > 0) {
    console.log(`\n📝 Sample props extraction (${withProps[0].name}):`);
    for (const prop of withProps[0].props.slice(0, 3)) {
      console.log(
        `   - ${prop.name}: ${prop.type}${prop.defaultValue ? ` = ${prop.defaultValue}` : ""}`,
      );
    }
  }

  writeOutput(components, hooks);

  console.log("\n✨ Done!");
}

main();
