// source_handbook: week11-hackathon-preparation
import { AILogEntry } from './types';

let logs: AILogEntry[] = [];

export function logAICall(entry: Omit<AILogEntry, 'id' | 'timestamp'>): AILogEntry {
  const fullEntry: AILogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  logs.push(fullEntry);
  // Keep only last 100 logs for memory efficiency
  if (logs.length > 100) logs.shift();
  return fullEntry;
}

export function getLogs(): AILogEntry[] {
  return logs;
}
