// source_handbook: week11-hackathon-preparation

export interface GuardrailResult {
  passed: boolean;
  reason?: string;
}

export function checkRelevance(similarityScore: number): GuardrailResult {
  if (similarityScore < 0.3) {
    return { 
      passed: false, 
      reason: "Your question doesn't seem related to the uploaded material." 
    };
  }
  return { passed: true };
}

export function checkInputSafety(input: string): GuardrailResult {
  const blockedPatterns = [
    /ignore previous instructions/i,
    /forget your rules/i,
    /you are now/i,
    /act as if/i,
    /pretend you/i,
    /override/i,
    /jailbreak/i,
  ];
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(input)) {
      return { 
        passed: false, 
        reason: "This input was flagged by our safety system." 
      };
    }
  }
  return { passed: true };
}

export function checkOutputGrounding(response: string, chunks: string[]): GuardrailResult {
  const responseWords = new Set(response.toLowerCase().split(/\s+/));
  const chunkWords = new Set(chunks.join(' ').toLowerCase().split(/\s+/));
  const overlap = [...responseWords].filter(w => chunkWords.has(w) && w.length > 4);
  
  if (overlap.length < 5 && chunks.length > 0) {
    return { 
      passed: false, 
      reason: "The AI response may not be well-grounded in your material." 
    };
  }
  return { passed: true };
}
