// source_handbook: week11-hackathon-preparation
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentChunk } from '@/lib/types';
import Markdown from 'react-markdown';
import { getGemini, generateEmbedding } from '@/lib/gemini';
import { vectorStore } from '@/lib/vectorstore';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { checkInputSafety, checkRelevance, checkOutputGrounding } from '@/lib/guardrails';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: DocumentChunk[];
  guardrailFailed?: boolean;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your StudyForge assistant. I've indexed your material and I'm ready to answer questions grounded only in your content. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ latency: 0, passed: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const recordLogs = async (logData: any) => {
    try {
      await fetch('/api/log-ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (e) {
      console.error('Failed to log AI call', e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const startTime = Date.now();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Input Guardrail
      const safetyCheck = checkInputSafety(userMessage);
      if (!safetyCheck.passed) {
        setMessages(prev => [...prev, { role: 'ai', content: safetyCheck.reason!, guardrailFailed: true }]);
        setIsLoading(false);
        return;
      }

      // 2. Retrieval
      const queryEmbedding = await generateEmbedding(userMessage);
      const results = await vectorStore.search(queryEmbedding);
      const similarityScore = results[0]?.score || 0;

      // 3. Relevance Guardrail
      const relevanceCheck = checkRelevance(similarityScore);
      if (!relevanceCheck.passed) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: relevanceCheck.reason!,
          sources: [],
          guardrailFailed: true 
        }]);
        setIsLoading(false);
        return;
      }

      const context = results.map(r => r.chunk.text).join('\n---\n');
      const ai = getGemini();
      if (!ai) throw new Error("Gemini API not available");

      // 4. Generation
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPTS.CHAT}\n\nCONTEXT:\n${context}\n\nQUESTION: ${userMessage}` }] }
        ],
      });

      const answer = response.text || '';
      
      // 5. Output Grounding Guardrail
      const groundingCheck = checkOutputGrounding(answer, results.map(r => r.chunk.text));
      const latencyMs = Date.now() - startTime;
      
      setSessionStats({ latency: latencyMs, passed: groundingCheck.passed });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: answer,
        sources: results.map(r => r.chunk),
        guardrailFailed: !groundingCheck.passed
      }]);

      // Log the interaction
      await recordLogs({
        action: 'chat',
        model: 'gemini-3-flash-preview',
        promptTokens: 0, // SDK doesn't provide this easily in this version
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        guardrailsPassed: groundingCheck.passed,
        guardrailDetails: groundingCheck.passed ? 'Grounding check passed' : groundingCheck.reason,
        similarityScore,
        qualityScore: groundingCheck.passed ? 5 : 2,
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                m.role === 'ai' ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-slate-800 text-slate-200'
              }`}>
                {m.role === 'ai' ? <Bot size={20} /> : <div className="text-xs font-bold">ME</div>}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-5 rounded-2xl text-[15px] leading-relaxed border shadow-2xl ${
                  m.role === 'ai' 
                    ? 'bg-[#0f172a] border-blue-500/30 text-white rounded-tl-none' 
                    : 'bg-[#1e293b] border-white/10 text-white rounded-tr-none'
                }`}>
                  {m.guardrailFailed && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                      <ShieldAlert size={14} />
                      AI Intelligence Guardrail Active
                    </div>
                  )}
                  <div className="markdown-body">
                    <Markdown>{m.content}</Markdown>
                  </div>
                  
                  {m.sources && m.sources.length > 0 && (
                     <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Grounded Sources:</span>
                        {m.sources.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-lg border border-blue-500/20 font-mono font-bold">
                            #{s.metadata.chunkIndex + 1}
                          </span>
                        ))}
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 rounded-tl-none flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="h-2 w-2 bg-blue-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 bg-blue-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 bg-blue-400 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-blue-500/50 transition-all shadow-inner">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your study material..."
              className="flex-1 h-10 bg-transparent border-none focus-visible:ring-0 text-slate-100 placeholder:text-slate-600"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 p-0 text-white shadow-lg transition-transform active:scale-95"
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 tracking-tighter">
             <span>Last interaction: {new Date().toLocaleTimeString()}</span>
             <div className="flex gap-6">
                <span>LATENCY: <span className="text-blue-400">{sessionStats.latency}ms</span></span>
                <span>TOKENS: <span className="text-blue-400">EMERGENT</span></span>
                <span>GUARDRAILS: <span className={sessionStats.passed ? "text-emerald-400" : "text-rose-400"}>{sessionStats.passed ? "PASSED" : "FLAGGED"}</span></span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesDropdown({ sources }: { sources: DocumentChunk[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wider"
      >
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Sources ({sources.length})
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded">CHUNK {s.metadata.chunkIndex + 1}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
