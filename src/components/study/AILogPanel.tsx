// source_handbook: week11-hackathon-preparation
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AILogEntry } from '@/lib/types';
import { Activity, Clock, Cpu, ShieldCheck, AlertTriangle } from 'lucide-react';

export function AILogPanel() {
  const [logs, setLogs] = useState<AILogEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        setLogs(data.reverse());
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const stats = {
    totalCalls: logs.length,
    totalTokens: logs.reduce((acc, l) => acc + (l.totalTokens || 0), 0),
    avgLatency: logs.length ? Math.round(logs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / logs.length) : 0,
    guardrailPassRate: logs.length ? Math.round((logs.filter(l => l.guardrailsPassed).length / logs.length) * 100) : 0,
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="p-8 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-8 px-2">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
               <Activity className="w-6 h-6 text-blue-400" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white leading-none mb-1">Intelligence Analytics</h3>
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Real-time evaluation & audit logging</p>
             </div>
           </div>
           
           <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Avg Latency</div>
                <div className="text-xl font-black text-white">{stats.avgLatency}ms</div>
             </div>
             <div className="text-right border-l border-white/10 pl-10">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Total Signals</div>
                <div className="text-xl font-black text-white">{stats.totalCalls}</div>
             </div>
             <div className="text-right border-l border-white/10 pl-10">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Safety Lock</div>
                <div className="text-xl font-black text-emerald-500">ENGAGED</div>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity} label="Total Calls" value={stats.totalCalls.toString()} color="blue" />
          <StatCard icon={Cpu} label="Total Tokens" value={stats.totalTokens.toLocaleString()} color="violet" />
          <StatCard icon={Clock} label="Avg Latency" value={`${stats.avgLatency}ms`} color="amber" />
          <StatCard icon={ShieldCheck} label="Safe Pass" value={`${stats.guardrailPassRate}%`} color="emerald" />
        </div>
      </div>

      <div className="flex-1 p-8 pt-0 overflow-y-auto">
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/10">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4 pl-6">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</TableHead>
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Tokens</TableHead>
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Latency</TableHead>
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Guardrails</TableHead>
                <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-6">Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-mono italic text-xs uppercase tracking-tighter">
                    No intelligence signals intercepted yet...
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="font-mono text-[10px] text-slate-400 py-4 pl-6">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-md border-white/10 font-mono text-[9px] uppercase transition-all bg-white/5 text-slate-400">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[10px] text-slate-300">{log.totalTokens}</TableCell>
                    <TableCell className="text-right font-mono text-[10px] text-blue-400 font-bold">{log.latencyMs}ms</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {log.guardrailsPassed ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                             <ShieldCheck className="w-3 h-3 text-emerald-500" />
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">PASSED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                             <AlertTriangle className="w-3 h-3 text-rose-500" />
                             <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">BLOCKED</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex justify-end gap-0.5">
                         {[1, 2, 3, 4, 5].map((s) => (
                           <div 
                             key={s} 
                             className={`w-1 h-3 rounded-full ${s <= (log.qualityScore || 0) ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-white/5'}`} 
                           />
                         ))}
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
  };

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-black text-white mb-1 leading-none">{value}</div>
      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</div>
    </div>
  );
}
