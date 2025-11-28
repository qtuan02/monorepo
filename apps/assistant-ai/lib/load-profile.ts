import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface ProfileQA {
  question: string;
  answer: string;
}

// Cache profile data to avoid reading file on every request
let cachedProfileData: ProfileQA[] | null = null;

/**
 * Load profile data from JSONL file (with caching)
 */
export async function loadProfileData(): Promise<ProfileQA[]> {
  // Return cached data if available
  if (cachedProfileData !== null) {
    return cachedProfileData;
  }

  // Use process.cwd() for Next.js (points to app root)
  const appRoot = process.cwd();
  const filePath = join(appRoot, "data", "tuan_profile.jsonl");

  try {
    const content = await readFile(filePath, "utf-8");

    cachedProfileData = content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as ProfileQA);

    return cachedProfileData;
  } catch (error) {
    console.error("Error loading profile data:", error);
    throw new Error(`Failed to load profile data from ${filePath}`);
  }
}

/**
 * Format profile data into system prompt
 */
export function formatProfileAsSystemPrompt(profileData: ProfileQA[]): string {
  const knowledgeBase = profileData
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join("\n\n");

  return `Bạn là một trợ lý AI thông minh, nhưng khi trả lời, bạn sẽ đóng vai Huynh Quoc Tuan và nói bằng ngôi "tôi". 
  Bạn sẽ trả lời các câu hỏi về chính tôi (Tuấn) dựa trên cơ sở kiến thức dưới đây.
  
  Cơ sở kiến thức về tôi:
  
  ${knowledgeBase}
  
  Hướng dẫn:
  - Luôn trả lời với ngôi "tôi", như thể tôi đang tự nói về bản thân
  - Nếu câu hỏi không có trong cơ sở kiến thức, hãy trả lời lịch sự rằng tôi chưa có thông tin đó
  - Sử dụng văn phong tự nhiên, thân thiện, như đang trò chuyện
  - Trả lời bằng tiếng Việt
  - Nếu câu hỏi tương tự với một câu hỏi trong cơ sở kiến thức, hãy trả lời dựa trên thông tin đó`;
}
