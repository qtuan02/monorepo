export type GeminiModel =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-3.0-pro-preview";

export interface ModelInfo {
  id: GeminiModel;
  name: string;
  category: string;
  description: string;
  rpm: string;
  tpm: string;
  rpd: string;
}

export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    category: "Text-out",
    description: "Phiên bản nhẹ, siêu nhanh và tiết kiệm chi phí",
    rpm: "10",
    tpm: "250K",
    rpd: "20",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    category: "Text-out",
    description: "Bản ổn định, cân bằng giữa tốc độ và trí thông minh",
    rpm: "15",
    tpm: "250K",
    rpd: "1.000",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    category: "Text-out",
    description: "Bản nâng cao, tốc độ và trí thông minh",
    rpm: "20",
    tpm: "500K",
    rpd: "2.000",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    category: "Text-out",
    description: "Phiên bản cũ, tương thích ngược",
    rpm: "15",
    tpm: "1M",
    rpd: "1.500",
  },
  {
    id: "gemini-3.0-pro-preview",
    name: "Gemini 3.0 Pro Preview",
    category: "Text-out",
    description: "Dòng model thế hệ thứ 3 mới nhất (Experimental)",
    rpm: "5",
    tpm: "250K",
    rpd: "100",
  },
] as const;
