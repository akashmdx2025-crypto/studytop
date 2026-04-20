// source_handbook: week11-hackathon-preparation
import { motion } from 'motion/react';

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Material Synch",
      description: "Directly initialize the knowledge core by uploading academic PDFs or technical documentation."
    },
    {
      number: "02",
      title: "Vector Indexing",
      description: "Semantic partitioning and high-dimensional embedding for precision information retrieval."
    },
    {
      number: "03",
      title: "Neural Forge",
      description: "Synthesize intelligence via grounded AI chat, custom assessments, and distillation layers."
    }
  ];

  return (
    <section className="py-32 bg-[#020202] px-6 relative">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="flex flex-col items-start text-left">
                <span className="text-[120px] font-black text-white/[0.03] absolute -top-16 -left-4 leading-none select-none group-hover:text-blue-600/[0.08] transition-colors duration-700 font-mono">
                  {step.number}
                </span>
                <div className="w-16 h-1.5 bg-blue-600 mb-10 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                <h3 className="text-3xl font-black text-white mb-5 tracking-tighter">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-20 bg-[#020202] px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="text-left">
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-2">StudyForge AI Studio</p>
          <p className="text-slate-600 text-xs font-medium">Built for CST4625 Generative AI Module | Technical Excellence Core</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
             <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
             <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
             <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
          </div>
          <p className="text-slate-700 text-[10px] font-mono">© 2026 NEURAL FORGE SYSTEMS [GEMINI-INIT]</p>
        </div>
      </div>
    </footer>
  );
}
