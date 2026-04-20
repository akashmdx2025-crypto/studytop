// source_handbook: week11-hackathon-preparation
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check, RefreshCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { getGemini } from '@/lib/gemini';
import { vectorStore } from '@/lib/vectorstore';
import { SYSTEM_PROMPTS } from '@/lib/prompts';

export function SummaryPanel() {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [level, setLevel] = useState<'brief' | 'standard' | 'detailed'>('standard');

  const generateSummary = async () => {
    setIsGenerating(true);
    const startTime = Date.now();
    try {
      const allChunks = vectorStore.getChunks();
      if (allChunks.length === 0) {
        throw new Error("No study material found. Please upload a document first.");
      }

      const chunks = allChunks.slice(0, 20).map(c => c.text).join('\n---\n');
      const ai = getGemini();
      if (!ai) throw new Error("Gemini API not available");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPTS.SUMMARY.replace('{detail_level}', level)}\n\nMATERIAL:\n${chunks}` }] }
        ],
      });

      let text = response.text || '';
      if (text.includes('```')) {
        text = text.replace(/```markdown\n?|```/g, '').trim();
      }
      setSummary(text);

      // Log
      await fetch('/api/log-ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summary',
          model: 'gemini-3-flash-preview',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          latencyMs: Date.now() - startTime,
          guardrailsPassed: true,
        }),
      });

    } catch (err: any) {
      toast.error(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!summary && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/10">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 italic">Synthesis Forge</h2>
          <p className="text-slate-300 mb-10 max-w-md mx-auto leading-relaxed">
            Distill massive volumes of text into a high-density intelligence summary. AI analyzes thematic weight and relevance.
          </p>
          
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-3 bg-black/20 p-1.5 rounded-2xl border border-white/5">
              {(['brief', 'standard', 'detailed'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`
                    px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${level === l ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button 
              onClick={generateSummary}
              className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
            >
              Forge Summary
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <div className="w-16 h-16 relative mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-blue-500/10 rounded-xl" />
            <motion.div 
              animate={{ width: ['0%', '100%'], left: ['0%', '0%'] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute top-1/2 left-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Distilling insights...</h3>
          <p className="text-slate-500 text-sm italic font-mono uppercase tracking-tighter">Running recursive distillation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <FileText size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none mb-1">Synthesized Insight</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Level: {level} · {summary.split(/\s+/).length} Words</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Button 
             onClick={copyToClipboard}
             variant="outline"
             className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold"
           >
             {copied ? <Check size={16} /> : <Copy size={16} />}
             <span className="ml-2 uppercase tracking-widest font-black">{copied ? 'Copied' : 'Copy Artifact'}</span>
           </Button>
           <Button 
             onClick={generateSummary}
             variant="outline"
             className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold"
           >
             <RefreshCcw size={16} />
             <span className="ml-2 uppercase tracking-widest font-black">Re-forge</span>
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 rounded-[3rem]"
          >
            <div className="markdown-body p-8 bg-black/30 rounded-3xl border border-white/5 shadow-inner min-h-[400px]">
              <Markdown>{summary}</Markdown>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



