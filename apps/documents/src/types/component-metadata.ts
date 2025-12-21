export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ComponentMetadata {
  id: string;
  name: string;
  description: string | null;
  category: string; // Categories: Form, Layout, Feedback, Data Display, Navigation, Uncategorized
  package: "ui";
  filePath: string;
  props: ComponentProp[];
  sourceCode: string;
  examples?: string[];
}

