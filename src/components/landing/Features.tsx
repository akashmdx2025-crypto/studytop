// source_handbook: week11-hackathon-preparation
import { motion } from 'motion/react';
import { FileText, Brain, ListChecks, LucideIcon, Layers, BarChart3, ShieldCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  const colorMap: any = {
    blue: "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-blue-500/5",
    violet: "bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-violet-500/5",
    emerald: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    amber: "bg-amber-600/10 text-amber-400 border-amber-500/20 shadow-amber-500/5",
    rose: "bg-rose-600/10 text-rose-400 border-rose-500/20 shadow-rose-500/5",
    cyan: "bg-cyan-600/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5"
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-10 rounded-[2.5rem] bg-[#050505] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <Icon size={120} className={`opacity-[0.03] rotate-12 -mr-6 -mt-6 ${colorMap[color].split(' ')[1]}`} />
      </div>

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border transition-transform duration-500 group-hover:scale-110 ${colorMap[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium text-[15px]">{description}</p>
    </motion.div>
  );
}

export function Features() {
  const features = [
    {
      icon: FileText,
      title: "RAG Pipeline",
      description: "Proprietary vector embedding technology that partitions, indexes, and queries your material with zero latency.",
      color: "blue"
    },
    {
      icon: Brain,
      title: "Grounded Chat",
      description: "Interactive AI tutor that rejects hallucinations and strictly adheres to your provided source text.",
      color: "violet"
    },
    {
      icon: ListChecks,
      title: "Quiz Synthesis",
      description: "Generative evaluation engine that identifies core axioms and terminology for custom assessments.",
      color: "emerald"
    },
    {
      icon: Layers,
      title: "Flashcard Core",
      description: "Distillation algorithms that extract high-weight concepts for spaced-repetition memory retention.",
      color: "amber"
    },
    {
      icon: BarChart3,
      title: "Audit Observability",
      description: "Full-stack logging for every AI signal, providing transparent latency monitoring and quality scoring.",
      color: "rose"
    },
    {
      icon: ShieldCheck,
      title: "Safety Shield",
      description: "Multi-modal guardrails that monitor input/output integrity to maintain an educational focus.",
      color: "cyan"
    }
  ];

  return (
    <section className="py-32 bg-[#020202] px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 mb-8">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System Capabilities</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">High-Density AI Training</h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">Engineered for architectural honesty and maximum pedagogical impact.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
