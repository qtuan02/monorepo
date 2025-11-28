import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cosineSimilarity from "compute-cosine-similarity";

import type { ProfileQA } from "./load-profile";
import { env } from "../env";
import { loadProfileData } from "./load-profile";

export interface QAWithEmbedding extends ProfileQA {
  embedding: number[];
}

// Cache embeddings to avoid regenerating on every request
let cachedEmbeddings: QAWithEmbedding[] | null = null;

/**
 * Get path to embeddings cache file
 */
function getEmbeddingsCachePath(): string {
  const appRoot = process.cwd();
  return join(appRoot, "data", "embeddings-cache.json");
}

/**
 * Load embeddings from cache file
 */
async function loadEmbeddingsFromCache(): Promise<QAWithEmbedding[] | null> {
  try {
    const cachePath = getEmbeddingsCachePath();
    const content = await readFile(cachePath, "utf-8");
    const cached = JSON.parse(content) as QAWithEmbedding[];
    console.log(`Loaded ${cached.length} embeddings from cache`);
    return cached;
  } catch {
    console.log("No embeddings cache found, will generate new embeddings");
    return null;
  }
}

/**
 * Save embeddings to cache file
 */
async function saveEmbeddingsToCache(
  embeddings: QAWithEmbedding[],
): Promise<void> {
  try {
    const cachePath = getEmbeddingsCachePath();
    await writeFile(cachePath, JSON.stringify(embeddings, null, 2), "utf-8");
    console.log(`Saved ${embeddings.length} embeddings to cache`);
  } catch (error) {
    console.error("Failed to save embeddings cache:", error);
  }
}

/**
 * Initialize Google Generative AI client
 */
function getGenAI() {
  return new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/**
 * Generate embedding for a text using Google's embedding model
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAI();

  try {
    // Use the embedding model
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);

    // Extract embedding from result
    const embedding = result.embedding?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Failed to generate embedding: empty result");
    }

    // Convert to number array - embedding.values is already number[]
    const embeddingArray: number[] = Array.isArray(embedding)
      ? embedding
      : Array.from(embedding);
    console.log(`Generated embedding with ${embeddingArray.length} dimensions`);

    return embeddingArray;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for all Q&A pairs
 */
async function generateQAEmbeddings(): Promise<QAWithEmbedding[]> {
  // Return cached embeddings if available in memory
  if (cachedEmbeddings !== null) {
    return cachedEmbeddings;
  }

  // Try to load from file cache
  const fileCached = await loadEmbeddingsFromCache();
  if (fileCached !== null) {
    cachedEmbeddings = fileCached;
    return fileCached;
  }

  // Generate new embeddings
  console.log("Generating new embeddings for Q&A pairs...");
  const profileData = await loadProfileData();
  console.log(`Processing ${profileData.length} Q&A pairs...`);

  // Generate embeddings for each Q&A pair
  // We'll embed the question + answer together for better context
  const embeddings = await Promise.all(
    profileData.map(async (qa, index) => {
      // Combine question and answer for embedding
      const text = `Q: ${qa.question}\nA: ${qa.answer}`;
      console.log(`Generating embedding ${index + 1}/${profileData.length}...`);
      const embedding = await generateEmbedding(text);

      return {
        ...qa,
        embedding,
      };
    }),
  );

  // Cache in memory and save to file
  cachedEmbeddings = embeddings;
  await saveEmbeddingsToCache(embeddings);
  console.log(
    `Successfully generated and cached ${embeddings.length} embeddings`,
  );

  return embeddings;
}

/**
 * Find top-k most relevant Q&A pairs for a given query using vector similarity
 */
export async function findRelevantQA(
  query: string,
  topK = 3,
): Promise<ProfileQA[]> {
  console.log(`Finding relevant Q&A for query: "${query.substring(0, 50)}..."`);

  // Generate embedding for the query
  console.log("Generating query embedding...");
  const queryEmbedding = await generateEmbedding(query);
  console.log(`Query embedding generated: ${queryEmbedding.length} dimensions`);

  // Get all Q&A with embeddings
  const qaWithEmbeddings = await generateQAEmbeddings();
  console.log(`Comparing against ${qaWithEmbeddings.length} Q&A embeddings...`);

  // Calculate similarity scores using cosine similarity
  const similarities = qaWithEmbeddings
    .map((qa) => {
      const similarity = cosineSimilarity(queryEmbedding, qa.embedding);
      return {
        qa,
        similarity: similarity ?? 0, // Handle null case
      };
    })
    .filter((item) => !Number.isNaN(item.similarity)); // Filter out NaN values

  // Sort by similarity (descending) and get top-k
  const topSimilar = similarities
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, topK);

  // Log similarity scores
  console.log(
    `Top ${topSimilar.length} relevant Q&A found with similarities:`,
    topSimilar.map((item) => ({
      question: item.qa.question.substring(0, 40) + "...",
      similarity: item.similarity.toFixed(4),
    })),
  );

  return topSimilar.map((item) => item.qa);
}

/**
 * Detect if text is primarily in English
 */
function isEnglish(text: string): boolean {
  // Simple heuristic: check if text contains more English characters/words
  const englishPattern = /[a-zA-Z]/g;
  const vietnamesePattern =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;

  const englishMatches = text.match(englishPattern)?.length ?? 0;
  const vietnameseMatches = text.match(vietnamesePattern)?.length ?? 0;

  // If has Vietnamese characters, it's Vietnamese
  if (vietnameseMatches > 0) return false;
  // If has English characters and no Vietnamese, it's English
  if (englishMatches > 0) return true;
  // Default to Vietnamese
  return false;
}

/**
 * Format relevant Q&A into context for Gemini
 */
export function formatRelevantContext(
  relevantQA: ProfileQA[],
  isQueryEnglish = false,
): string {
  if (relevantQA.length === 0) {
    return isQueryEnglish
      ? "No relevant information found in the knowledge base."
      : "Không có thông tin liên quan trong cơ sở kiến thức.";
  }

  const knowledgeBase = relevantQA
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join("\n\n");

  return isQueryEnglish
    ? `Based on the following knowledge base about Huynh Quoc Tuan:

${knowledgeBase}`
    : `Dựa trên cơ sở kiến thức sau đây về Huynh Quoc Tuan:

${knowledgeBase}`;
}

/**
 * Detect language from query and return language info
 */
export function detectLanguage(query: string): {
  isEnglish: boolean;
  language: "vi" | "en";
} {
  const isEnglishLang = isEnglish(query);
  return {
    isEnglish: isEnglishLang,
    language: isEnglishLang ? "en" : "vi",
  };
}
