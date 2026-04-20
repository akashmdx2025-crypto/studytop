// source_handbook: week11-hackathon-preparation
import { DocumentChunk } from './types';

class InMemoryVectorStore {
  private chunks: DocumentChunk[] = [];

  addChunks(chunks: DocumentChunk[]) {
    this.chunks = [...this.chunks, ...chunks];
  }

  clear() {
    this.chunks = [];
  }

  async search(queryEmbedding: number[], topK: number = 3): Promise<{ chunk: DocumentChunk; score: number }[]> {
    if (!this.chunks.length) return [];

    const results = this.chunks
      .filter(c => c.embedding)
      .map(chunk => ({
        chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }

  getChunks() {
    return this.chunks;
  }
}

export const vectorStore = new InMemoryVectorStore();
