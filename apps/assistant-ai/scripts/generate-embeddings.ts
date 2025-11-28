import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

import type { ProfileQA } from "../lib/load-profile";
import { env } from "../env";
import { loadProfileData } from "../lib/load-profile";

interface QAWithEmbedding extends ProfileQA {
  embedding: number[];
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
 * Get path to embeddings cache file
 */
function getEmbeddingsCachePath(): string {
  const appRoot = process.cwd();
  return join(appRoot, "data", "embeddings-cache.json");
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
    console.log(`✅ Saved ${embeddings.length} embeddings to cache`);
  } catch (error) {
    console.error("❌ Failed to save embeddings cache:", error);
    throw error;
  }
}

/**
 * Main function to regenerate embeddings
 */
async function regenerateEmbeddings() {
  console.log("🔄 Starting embedding regeneration...\n");

  // Load profile data
  console.log("📖 Loading profile data...");
  const profileData = await loadProfileData();
  console.log(`📊 Found ${profileData.length} Q&A pairs\n`);

  // Generate embeddings for each Q&A pair
  console.log("⚙️  Generating embeddings...");
  const embeddings: QAWithEmbedding[] = [];

  for (let i = 0; i < profileData.length; i++) {
    const qa = profileData[i];
    if (!qa) {
      console.warn(`  ⚠️  Skipping empty Q&A at index ${i}`);
      continue;
    }

    // Combine question and answer for embedding
    const text = `Q: ${qa.question}\nA: ${qa.answer}`;
    console.log(
      `  [${i + 1}/${profileData.length}] Generating embedding for: "${qa.question.substring(0, 100)}${qa.question.length > 100 ? "..." : ""}"`,
    );

    try {
      const embedding = await generateEmbedding(text);
      embeddings.push({
        ...qa,
        embedding,
      });
    } catch (error) {
      console.error(
        `  ❌ Failed to generate embedding for Q&A ${i + 1}:`,
        error,
      );
      throw error;
    }
  }

  // Save to cache
  console.log("\n💾 Saving embeddings to cache...");
  await saveEmbeddingsToCache(embeddings);

  console.log(
    `\n✅ Successfully regenerated and cached ${embeddings.length} embeddings!`,
  );
}

// Run the script
regenerateEmbeddings().catch((error) => {
  console.error("❌ Error regenerating embeddings:", error);
  process.exit(1);
});
