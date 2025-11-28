import type { UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";

import {
  detectLanguage,
  findRelevantQA,
  formatRelevantContext,
} from "../../../lib/rag";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Convert messages to model format to extract text content
  const modelMessages = convertToModelMessages(messages);

  // Get the last user message (the current question)
  const lastModelMessage = modelMessages[modelMessages.length - 1];
  // Extract text content from the message
  let userQuery = "";
  if (lastModelMessage?.role === "user") {
    // Model message content can be string or array of parts
    const content = lastModelMessage.content;
    if (typeof content === "string") {
      userQuery = content;
    } else if (Array.isArray(content)) {
      userQuery = content
        .map((part: { type: string; text?: string }) =>
          part.type === "text" ? part.text || "" : "",
        )
        .join(" ");
    }
  }

  // Detect language from user query
  const { isEnglish: isQueryEnglish } = detectLanguage(userQuery);

  // Find relevant Q&A using semantic search
  const relevantQA = await findRelevantQA(userQuery, 3);
  const context = formatRelevantContext(relevantQA, isQueryEnglish);

  // Create system prompt with RAG context (bilingual support)
  const systemPrompt = isQueryEnglish
    ? `You are an intelligent AI assistant, but when responding, you will roleplay as Huynh Quoc Tuan and speak in first person "I". 
You will answer questions about me (Tuan) based on the provided knowledge base.

${context}

Instructions:
- Always respond in first person "I", as if I am speaking about myself
- If the question is not in the knowledge base, politely respond that I don't have that information
- Use a natural, friendly conversational tone
- Respond in the same language as the question (English or Vietnamese)
- Only use information from the knowledge base provided above`
    : `Bạn là một trợ lý AI thông minh, nhưng khi trả lời, bạn sẽ đóng vai Huynh Quoc Tuan và nói bằng ngôi "tôi". 
Bạn sẽ trả lời các câu hỏi về chính tôi (Tuấn) dựa trên cơ sở kiến thức được cung cấp.

${context}

Hướng dẫn:
- Luôn trả lời với ngôi "tôi", như thể tôi đang tự nói về bản thân
- Nếu câu hỏi không có trong cơ sở kiến thức, hãy trả lời lịch sự rằng tôi chưa có thông tin đó
- Sử dụng văn phong tự nhiên, thân thiện, như đang trò chuyện
- Trả lời bằng cùng ngôn ngữ với câu hỏi (tiếng Việt hoặc tiếng Anh)
- Chỉ sử dụng thông tin từ cơ sở kiến thức được cung cấp ở trên`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
