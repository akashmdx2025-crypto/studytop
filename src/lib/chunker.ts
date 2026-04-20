// source_handbook: week11-hackathon-preparation
import { DocumentChunk } from './types';

export function chunkText(text: string, chunkSize: number = 2000, overlap: number = 200): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    let chunkText = text.substring(startIndex, endIndex);

    chunks.push({
      id: crypto.randomUUID(),
      text: chunkText,
      metadata: {
        chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
      },
    });

    startIndex += chunkSize - overlap;
    chunkIndex++;
    
    if (endIndex === text.length) break;
  }

  return chunks;
}
