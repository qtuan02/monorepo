export interface HookParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface HookReturn {
  type: string;
  description?: string;
}

export interface HookMetadata {
  id: string;
  name: string;
  description: string | null;
  category: string; // Categories: Client-side, Utilities, Uncategorized
  package: "hook";
  filePath: string;
  parameters: HookParameter[];
  returns: HookReturn;
  sourceCode: string;
  previews?: string[];
}
