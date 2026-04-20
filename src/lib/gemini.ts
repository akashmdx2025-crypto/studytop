// source_handbook: week11-hackathon-preparation
import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGemini() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In development/preview this should be automatically set.
      // If it's missing, the app will fail when an AI call is made.
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      return null;
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export async function generateEmbeddings(texts: string[]) {
  const ai = getGemini();
  if (!ai) throw new Error("Gemini API not initialized");

  const results = await Promise.all(
    texts.map((text) =>
      ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [{ parts: [{ text }] }],
      })
    )
  );

  return results.map((r) => r.embeddings[0].values);
}

export async function generateEmbedding(text: string) {
  const ai = getGemini();
  if (!ai) throw new Error("Gemini API not initialized");

  const result = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [{ parts: [{ text }] }],
  });

  return result.embeddings[0].values;
}

export async function getTranscription(audioBase64: string, mimeType: string) {
  const ai = getGemini();
  if (!ai) throw new Error("Gemini API not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: "Generate a transcript of this audio. Return ONLY the transcript text." },
        ],
      },
    ],
  });

  return response.text;
}
