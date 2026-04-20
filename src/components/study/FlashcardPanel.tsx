// source_handbook: week11-hackathon-preparation
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Layers, ChevronLeft, ChevronRight, RefreshCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getGemini } from '@/lib/gemini';
import { vectorStore } from '@/lib/vectorstore';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { Type } from '@google/genai';

export function FlashcardPanel() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCards = async () => {
    setIsGenerating(true);
    const startTime = Date.now();
    try {
      const allChunks = vectorStore.getChunks();
      if (allChunks.length === 0) {
        throw new Error("No study material found. Please upload a document first.");
      }

      const chunks = allChunks.slice(0, 15).map(c => c.text).join('\n---\n');
      const ai = getGemini();
      if (!ai) throw new Error("Gemini API not available");

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPTS.FLASHCARDS.replace('{n}', '10')}\n\nMATERIAL:\n${chunks}` }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["flashcards"],
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["id", "front", "back"],
                  properties: {
                    id: { type: Type.INTEGER },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                  }
                }
              }
            }
          }
        }
      });

      let text = response.text || '{"flashcards":[]}';
      // Robust JSON extraction
      if (text.includes('```')) {
        text = text.replace(/```json\n?|```/g, '').trim();
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Flashcard Parse Error. Raw Text:", text);
        throw new Error("Failed to parse flashcard response. The AI might have returned malformed data.");
      }

      if (data && Array.isArray(data.flashcards)) {
        setCards(data.flashcards);
      } else {
        throw new Error("Invalid flashcard format received: 'flashcards' array missing");
      }
      setCurrentIndex(0);
      setIsFlipped(false);

      // Log
      await fetch('/api/log-ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'flashcards',
          model: 'gemini-3.1-pro-preview',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          latencyMs: Date.now() - startTime,
          guardrailsPassed: true,
        }),
      });

    } catch (err: any) {
      toast.error(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 100);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 100);
    }
  };

  if (cards.length === 0 && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/10">
            <Layers className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 italic">Concept Forge</h2>
          <p className="text-slate-300 mb-10 max-w-md mx-auto leading-relaxed">
            Condense complex materials into high-retention memory anchors. AI will extract core definitions and axioms.
          </p>
          <Button 
            onClick={generateCards}
            className="h-14 px-10 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-xl shadow-amber-600/20"
          >
            Initiate Extraction
          </Button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <motion.div 
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-24 h-16 bg-amber-600/10 border border-amber-600/40 rounded-xl flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="text-amber-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Extracting key concepts...</h3>
          <p className="text-slate-500 text-sm italic font-mono tracking-tighter uppercase">Parsing vector semantics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full pb-20">
          <div className="flex items-center justify-between px-2 mb-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Retainment Index</span>
              <span className="text-lg font-black text-white uppercase">Card {currentIndex + 1} <span className="text-slate-600 ml-1">/ {cards.length}</span></span>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                 onClick={prevCard} 
                 disabled={currentIndex === 0}
                 variant="outline" 
                 className="w-12 h-12 p-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30"
               >
                 <ChevronLeft size={20} />
               </Button>
               <Button 
                 onClick={nextCard} 
                 disabled={currentIndex === cards.length - 1}
                 variant="outline" 
                 className="w-12 h-12 p-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30"
               >
                 <ChevronRight size={20} />
               </Button>
            </div>
          </div>

          <div className="perspective-1000 h-[400px] relative w-full flex justify-center">
            <motion.div
              className="w-full max-w-md h-full relative preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="absolute inset-0 backface-hidden glass-panel p-10 flex flex-col items-center justify-center text-center rounded-[3rem]">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.4em] mb-8 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Concept</span>
                <h3 className="text-2xl font-bold text-white leading-tight px-4">
                  {cards[currentIndex].front}
                </h3>
                <div className="mt-12 flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest transition-all group-hover:text-blue-400">
                  <RefreshCcw size={12} className="animate-pulse" /> Click to flip forge
                </div>
              </div>
              
              <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] glass-panel bg-blue-600/5 p-10 flex flex-col items-center justify-center text-center rounded-[3rem] border-blue-500/20 shadow-blue-500/10">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.4em] mb-8 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Definition</span>
                <p className="text-lg text-slate-200 leading-relaxed font-medium px-4">
                  {cards[currentIndex].back}
                </p>
                <div className="mt-12 flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <RefreshCcw size={12} /> Flip to original
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center gap-4 mt-16">
            <Button variant="outline" className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 px-10 py-7 font-bold shadow-lg transition-transform active:scale-95">
              Study More
            </Button>
            <Button variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 px-10 py-7 font-bold shadow-lg transition-transform active:scale-95">
              Know it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
