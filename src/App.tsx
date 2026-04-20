// source_handbook: week11-hackathon-preparation
import { useState } from 'react';
import { Hero } from './components/landing/Hero';
import { Features } from './components/landing/Features';
import { HowItWorks, Footer } from './components/landing/HowItWorks';
import { FileUpload } from './components/study/FileUpload';
import { DocumentViewer } from './components/study/DocumentViewer';
import { ChatPanel } from './components/study/ChatPanel';
import { QuizPanel } from './components/study/QuizPanel';
import { FlashcardPanel } from './components/study/FlashcardPanel';
import { SummaryPanel } from './components/study/SummaryPanel';
import { AILogPanel } from './components/study/AILogPanel';
import { Toaster } from './components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { MessageSquare, Brain, Layers, FileText, Activity, LayoutDashboard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'landing' | 'study'>('landing');
  const [docData, setDocData] = useState<any>(null);

  const handleUploadSuccess = (data: any) => {
    setDocData(data);
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#020202]">
        <Hero onStart={() => setView('study')} />
        <Features />
        <HowItWorks />
        <Footer />
        <Toaster theme="dark" position="top-center" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#020202] text-slate-100 font-sans">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/40 border border-white/10 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">StudyForge <span className="text-blue-500 font-black">AI</span></span>
          <span className="ml-4 px-2 py-0.5 rounded-lg border border-white/5 text-[9px] uppercase font-black tracking-widest text-slate-500 bg-white/[0.02]">Studio Beta</span>
        </div>
        
        <div className="flex items-center gap-6">
           {docData && (
             <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural Link Active</span>
             </div>
           )}
           <button 
             onClick={() => setView('landing')}
             className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/10 text-white flex items-center gap-2"
           >
             <LayoutDashboard size={14} className="text-blue-400" />
             New Material
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
        <AnimatePresence mode="wait">
          {!docData ? (
            <motion.div 
              key="upload-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="max-w-2xl w-full text-center glass-panel p-16 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10">
                    <Activity size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ready for indexing</span>
                  </div>
                  <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none">Forge Your <span className="text-blue-500">Intelligence</span></h2>
                  <p className="text-slate-300 mb-14 text-lg font-medium max-w-md mx-auto leading-relaxed">Synchronize your study materials with our Generative AI core to unlock interactive learning transformation.</p>
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="workspace-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex overflow-hidden gap-6"
            >
              {/* Left Panel: Document Source */}
              <div className="w-[38%] flex flex-col gap-6">
                 <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
                    <DocumentViewer 
                      fileName={docData.fileName} 
                      chunks={docData.chunks} 
                      stats={docData.stats} 
                    />
                 </div>
              </div>

              {/* Right Panel: AI Tools */}
              <div className="flex-1 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                  <div className="border-b border-white/5 bg-black/20">
                    <TabsList className="h-16 bg-transparent gap-1 px-4">
                      <TabsTrigger value="chat" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl h-10 my-auto font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all flex items-center gap-2.5">
                        <MessageSquare size={14} /> Tutor
                      </TabsTrigger>
                      <TabsTrigger value="quiz" className="px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl h-10 my-auto font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all flex items-center gap-2.5">
                        <Brain size={14} /> Knowledge
                      </TabsTrigger>
                      <TabsTrigger value="flashcards" className="px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl h-10 my-auto font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all flex items-center gap-2.5">
                        <Layers size={14} /> Retention
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl h-10 my-auto font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all flex items-center gap-2.5">
                        <FileText size={14} /> Insights
                      </TabsTrigger>
                      <TabsTrigger value="logs" className="ml-auto px-5 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl h-10 my-auto font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-all flex items-center gap-2">
                        <Activity size={14} /> Audit
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="chat" className="h-full m-0 p-0">
                      <ChatPanel />
                    </TabsContent>
                    <TabsContent value="quiz" className="h-full m-0 p-0">
                      <QuizPanel />
                    </TabsContent>
                    <TabsContent value="flashcards" className="h-full m-0 p-0">
                      <FlashcardPanel />
                    </TabsContent>
                    <TabsContent value="summary" className="h-full m-0 p-0">
                      <SummaryPanel />
                    </TabsContent>
                    <TabsContent value="logs" className="h-full m-0 p-0">
                      <AILogPanel />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Toaster theme="dark" position="bottom-right" closeButton />
    </div>
  );
}
