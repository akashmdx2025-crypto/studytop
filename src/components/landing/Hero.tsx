// source_handbook: week11-hackathon-preparation
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { MousePointer2 } from 'lucide-react';

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020202]">
      {/* Structural Light Accents */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px] opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-6 max-w-6xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 mb-10 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">CST4625 GENAI RESEARCH PROJECT</span>
        </motion.div>
        
        <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter mb-10 leading-[0.85] text-balance">
          Forge Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">Intelligence</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
          Architectural-grade RAG engine for academic document synthesis. Chat, quiz, and summarize your own material with total precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Button 
            onClick={onStart}
            size="lg" 
            className="h-16 px-12 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-95 border border-blue-400/30 text-white"
          >
            INITIALIZE STUDIO →
          </Button>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-widest">
            <MousePointer2 className="w-5 h-5 text-blue-500" />
            <span>Interactive Protocol Ready</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
