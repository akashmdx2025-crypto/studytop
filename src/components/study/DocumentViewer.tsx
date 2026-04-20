// source_handbook: week11-hackathon-preparation
import { DocumentChunk, DocumentStats } from '@/lib/types';
import { FileText, Database, Hash, Type } from 'lucide-react';

interface DocumentViewerProps {
  fileName: string;
  chunks: DocumentChunk[];
  stats: DocumentStats | null;
}

export function DocumentViewer({ fileName, chunks, stats }: DocumentViewerProps) {
  return (
    <div className="h-full flex flex-col bg-[#050505]">
      <div className="p-6 border-b border-white/5 bg-black/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            Document Source
          </h2>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/5 px-2.5 py-1 rounded-full border border-blue-500/20">
            Synched
          </span>
        </div>

        <div className="p-4 bg-black border border-white/5 rounded-2xl text-sm text-slate-400 mb-6 transition-all hover:border-blue-500/40 shadow-inner group">
          <p className="font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">{fileName}</p>
          <p className="text-xs leading-relaxed opacity-60 line-clamp-3 italic">
            {chunks[0]?.text.substring(0, 180)}...
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <StatSmall label="Words" value={stats.wordCount.toLocaleString()} />
            <StatSmall label="Chunks" value={stats.chunkCount.toString()} />
            <StatSmall label="Kilochars" value={(stats.charCount / 1000).toFixed(1)} />
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Vectorized Content</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">Embedded</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4 font-mono text-[11px] leading-relaxed text-slate-500">
          {chunks.map((chunk, i) => (
            <div 
              key={chunk.id} 
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                i % 2 === 0 
                  ? 'border-blue-500/20 bg-blue-500/5 text-slate-300' 
                  : 'border-white/5 bg-white/[0.02] opacity-80'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${i % 2 === 0 ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'}`}>BLOCK {i}</span>
              </div>
              {chunk.text.substring(0, 250)}...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatSmall({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 text-center transition-all hover:bg-white/[0.05]">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-base font-black text-white leading-none">{value}</p>
    </div>
  );
}
