// source_handbook: week11-hackathon-preparation

export interface DocumentChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata: {
    chunkIndex: number;
    startChar: number;
    endChar: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  action: 'chat' | 'quiz' | 'flashcards' | 'summary' | 'upload';
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  guardrailsPassed: boolean;
  guardrailDetails?: string;
  similarityScore?: number;
  qualityScore?: number; 
}

export interface DocumentStats {
  wordCount: number;
  charCount: number;
  chunkCount: number;
}
