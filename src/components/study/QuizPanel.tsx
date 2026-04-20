// source_handbook: week11-hackathon-preparation
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle2, XCircle, RefreshCcw, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { getGemini } from '@/lib/gemini';
import { vectorStore } from '@/lib/vectorstore';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { Type } from '@google/genai';

export function QuizPanel() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const generateQuiz = async () => {
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
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPTS.QUIZ.replace('{n}', '5')}\n\nMATERIAL:\n${chunks}` }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["questions"],
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["id", "question", "options", "correct", "explanation"],
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.OBJECT,
                      required: ["A", "B", "C", "D"],
                      properties: {
                        A: { type: Type.STRING },
                        B: { type: Type.STRING },
                        C: { type: Type.STRING },
                        D: { type: Type.STRING },
                      }
                    },
                    correct: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  }
                }
              }
            }
          }
        }
      });

      let text = response.text || '{"questions":[]}';
      // Robust JSON extraction
      if (text.includes('```')) {
        text = text.replace(/```json\n?|```/g, '').trim();
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Quiz Parse Error. Raw Text:", text);
        throw new Error("Failed to parse quiz response. The AI might have returned malformed data.");
      }

      if (data && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error("Invalid quiz format received: 'questions' array missing");
      }
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsFinished(false);

      // Log
      await fetch('/api/log-ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quiz',
          model: 'gemini-3.1-pro-preview',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          latencyMs: Date.now() - startTime,
          guardrailsPassed: true,
        }),
      });

    } catch (err: any) {
      toast.error(`Failed to generate quiz: ${err.message}`);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    if (option === questions[currentIndex].correct) {
      setScore(s => s + 1);
      toast.success('Correct!', { position: 'top-center', duration: 1000 });
    } else {
      toast.error('Incorrect', { position: 'top-center', duration: 1000 });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      if (score >= questions.length / 2) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  if (questions.length === 0 && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
            <Brain className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 italic">Knowledge Forge</h2>
          <p className="text-slate-300 mb-10 max-w-md mx-auto leading-relaxed">
            Transform your document into a challenging assessment. AI will synthesize key concepts into a unique quiz.
          </p>
          <Button 
            onClick={generateQuiz}
            className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xl shadow-emerald-600/20"
          >
            Ignite assessment
          </Button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <div className="relative mb-8 flex justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Forging your quiz...</h3>
          <p className="text-slate-500 text-sm italic font-mono tracking-tighter">AI AGENT ANALYZING VECTOR INDEX</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full border-4 border-blue-500/10 flex items-center justify-center mx-auto mb-8 bg-blue-500/5 relative"
          >
            <Trophy className="w-16 h-16 text-blue-400" />
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white font-black px-3 py-1 rounded-lg text-sm shadow-lg">
              {percentage}%
            </div>
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Forge Complete</h2>
          <p className="text-slate-400 mb-8 font-mono uppercase text-xs tracking-[0.2em]">RESULT SCORE: {score} / {questions.length}</p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={generateQuiz} className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex gap-2 shadow-xl shadow-blue-600/20 transition-all">
              <RefreshCcw size={18} /> Re-forge Questions
            </Button>
            <Button onClick={() => setQuestions([])} variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
              Exit Studio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  if (!q || !q.options) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full glass-panel p-12 rounded-[2.5rem]">
          <p className="text-slate-400 mb-6">Incomplete question format detected.</p>
          <Button onClick={generateQuiz} className="bg-blue-600 hover:bg-blue-500">Regenerate Quiz</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full pb-12">
          <div className="flex justify-between items-end mb-8 px-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Question Progress</span>
              <div className="text-2xl font-black text-white">UNIT {currentIndex + 1} <span className="text-slate-600">/ {questions.length}</span></div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Current Accuracy</span>
              <div className="text-emerald-400 font-mono font-black">{score} SUCCESSES</div>
            </div>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-12 border border-white/5 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="glass-panel p-10 rounded-[2.5rem]"
            >
              <h3 className="text-2xl font-bold text-white mb-10 leading-tight">
                {q.question}
              </h3>

              <div className="grid gap-3">
                {Object.entries(q.options || {}).map(([key, value], idx) => {
                  const isSelected = selectedOption === key;
                  const isCorrect = key === q.correct;
                  const showResult = selectedOption !== null;

                  let variant = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
                  if (showResult && isCorrect) variant = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10";
                  else if (showResult && isSelected && !isCorrect) variant = "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10";
                  else if (showResult) variant = "bg-white/5 border-white/5 opacity-40";
                  else if (isSelected) variant = "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/10";

                  return (
                    <button
                      key={key}
                      disabled={showResult}
                      onClick={() => handleOptionSelect(key)}
                      className={`
                        w-full p-5 rounded-2xl border text-left transition-all relative flex items-center justify-between group
                        ${variant}
                      `}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shrink-0 border transition-colors
                          ${showResult && isCorrect ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-black/30 text-slate-500 border-white/5 group-hover:border-white/20'}
                        `}>
                          {key}
                        </div>
                        <span className="text-sm font-medium pr-10">{value}</span>
                      </div>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 shrink-0 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 p-6 rounded-2xl bg-black/30 border border-white/10 shadow-inner">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                        <Loader2 size={12} className="text-blue-400" /> Grounded RAG Extraction
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">{q.explanation}</p>
                    </div>

                    <div className="mt-8">
                      <Button 
                        onClick={handleNext}
                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black flex gap-2 group shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02]"
                      >
                        {currentIndex === questions.length - 1 ? 'Finalize Forge' : 'Advance to next unit'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
