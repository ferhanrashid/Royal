import React from 'react';
import { mockDb } from '../mockDb';
import { ArrowLeft, History as HistoryIcon, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function History({ user, onBack }: { user: any, onBack: () => void }) {
  const sessions = mockDb.getSessions().filter((s: any) => s.userId === user.uid);
  const deposits = mockDb.getDepositRequests().filter((d: any) => d.userId === user.uid);
  const withdrawals = mockDb.getWithdrawalRequests().filter((w: any) => w.userId === user.uid);

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">History</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Your activity log</p>
          </div>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 ml-1">Bets</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2">
              {sessions.length === 0 ? <p className="text-white/20 text-sm text-center py-4">No bets yet</p> : sessions.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                  <div>
                    <p className="font-bold">{s.gameType}</p>
                    <p className="text-[10px] text-white/40">{new Date(s.timestamp).toLocaleString()}</p>
                  </div>
                  <p className={`font-bold ${s.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                    {s.result === 'win' ? '+' : '-'}{s.amount} ETB
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 ml-1">Deposits</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2">
              {deposits.length === 0 ? <p className="text-white/20 text-sm text-center py-4">No deposits yet</p> : deposits.map((d: any) => (
                <div key={d.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                  <div>
                    <p className="font-bold">Deposit</p>
                    <p className="text-[10px] text-white/40">{new Date(d.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">+{d.amount} ETB</span>
                    {d.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : d.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 ml-1">Withdrawals</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2">
              {withdrawals.length === 0 ? <p className="text-white/20 text-sm text-center py-4">No withdrawals yet</p> : withdrawals.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                  <div>
                    <p className="font-bold">Withdrawal</p>
                    <p className="text-[10px] text-white/40">{new Date(w.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-{w.amount} ETB</span>
                    {w.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : w.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
