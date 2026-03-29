import React, { useState, useEffect } from 'react';
import { mockDb, mockAuth } from '../mockDb';
import { 
  Users, TrendingUp, History, ShieldAlert, ArrowLeft, 
  Save, Trash2, ArrowUpCircle, ArrowDownCircle, Check, X, LogOut 
} from 'lucide-react';

const UserRow: React.FC<{ user: any, onUpdateBalance: (id: string, field: 'balance' | 'demoBalance', amount: number) => void }> = ({ user, onUpdateBalance }) => {
  const [inputBalance, setInputBalance] = useState(user.balance.toString());
  const [inputDemoBalance, setInputDemoBalance] = useState((user.demoBalance || 0).toString());

  useEffect(() => {
    setInputBalance(user.balance.toString());
    setInputDemoBalance((user.demoBalance || 0).toString());
  }, [user.balance, user.demoBalance]);

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-6">
        <div className="font-bold">{user.phoneNumber || user.email}</div>
        <div className="text-[10px] text-white/30 font-mono">{user.uid}</div>
      </td>
      <td className="p-6">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-[#CE1126]/20 text-[#CE1126]' : 'bg-white/10 text-white/50'}`}>
          {user.role}
        </span>
      </td>
      <td className="p-6 font-mono text-[#FCD116] font-bold">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/40 uppercase w-8">Real:</span>
            <input
              type="number"
              value={inputBalance}
              onChange={(e) => setInputBalance(e.target.value)}
              className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                const num = Number(inputBalance);
                if (!isNaN(num) && num >= 0) onUpdateBalance(user.uid, 'balance', num);
              }}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              <Save className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/40 uppercase w-8">Demo:</span>
            <input
              type="number"
              value={inputDemoBalance}
              onChange={(e) => setInputDemoBalance(e.target.value)}
              className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                const num = Number(inputDemoBalance);
                if (!isNaN(num) && num >= 0) onUpdateBalance(user.uid, 'demoBalance', num);
              }}
              className="p-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg"
            >
              <Save className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateBalance(user.uid, 'balance', user.balance + 1000)}
            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
          >
            +1000 Real
          </button>
          <button
            onClick={() => onUpdateBalance(user.uid, 'demoBalance', (user.demoBalance || 0) + 1000)}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
          >
            +1000 Demo
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Admin({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'withdrawals' | 'activity'>('users');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const u = mockAuth.currentUser;
      if (u) {
        const profile = mockDb.getUser(u.uid);
        if (profile?.role === 'admin') {
          setIsAdmin(true);
          refreshData();
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
    const unsubscribe = mockAuth.onAuthStateChanged(checkAdmin);
    const interval = setInterval(refreshData, 5000); // Auto refresh
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refreshData = () => {
    const u = mockAuth.currentUser;
    if (!u) return;
    const profile = mockDb.getUser(u.uid);
    if (profile?.role !== 'admin') return;

    setUsers(mockDb.getAllUsers() || []);
    setSessions(mockDb.getSessions() || []);
    setDeposits(mockDb.getDepositRequests() || []);
    setWithdrawals(mockDb.getWithdrawalRequests() || []);
    setLoading(false);
  };

  const updateUserBalance = (userId: string, field: 'balance' | 'demoBalance', newBalance: number) => {
    mockDb.setUser(userId, { [field]: newBalance });
    setUsers(mockDb.getAllUsers());
  };

  const clearDemoData = () => {
    if (confirm('Are you sure you want to clear all demo data? This will reset all balances and history.')) {
      mockDb.clear();
      window.location.reload(); // Reload to reset state
    }
  };

  const handleDepositAction = (id: string, status: 'approved' | 'rejected') => {
    mockDb.updateDepositStatus(id, status);
    refreshData();
  };

  const handleWithdrawalAction = (id: string, status: 'approved' | 'rejected') => {
    mockDb.updateWithdrawalStatus(id, status);
    refreshData();
  };

  const handleLogout = () => {
    mockAuth.signOut();
    window.location.href = '/'; // Redirect to home on logout
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin Panel...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-widest text-white mb-2">Access Denied</h1>
        <p className="text-white/40 text-sm mb-8 max-w-xs">This area is restricted to administrators only. Please log in with an admin account.</p>
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all border border-white/10"
          >
            Return to Site
          </button>
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin Dashboard</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Royal Games Management</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-600/10 border border-red-600/20 rounded-2xl px-6 py-4 flex items-center gap-3 hover:bg-red-600/20 transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Logout</span>
            </button>
            <button
              onClick={clearDemoData}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#CE1126]/20 transition-colors"
            >
              <Trash2 className="text-[#CE1126]" />
              <div className="text-[10px] uppercase text-white/40">Clear Data</div>
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <Users className="text-[#FCD116]" />
              <div>
                <div className="text-[10px] uppercase text-white/40">Total Users</div>
                <div className="text-xl font-bold">{users.length}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] uppercase text-white/40 mb-1">Total Deposits</div>
            <div className="text-2xl font-black text-green-400">
              {deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0).toLocaleString()} ETB
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] uppercase text-white/40 mb-1">Total Withdrawals</div>
            <div className="text-2xl font-black text-blue-400">
              {withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0).toLocaleString()} ETB
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] uppercase text-white/40 mb-1">Net Profit</div>
            <div className="text-2xl font-black text-[#FCD116]">
              {(deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0) - 
                withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0)).toLocaleString()} ETB
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] uppercase text-white/40 mb-1">Active Sessions</div>
            <div className="text-2xl font-black text-purple-400">
              {sessions.filter(s => new Date(s.timestamp).getTime() > Date.now() - 3600000).length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Quick Actions
              </h3>
              <button 
                onClick={() => setActiveTab('deposits')}
                className="w-full flex items-center justify-between p-4 bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpCircle className="w-5 h-5 text-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Review Deposits</span>
                </div>
                {deposits.filter(d => d.status === 'pending').length > 0 && (
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">
                    {deposits.filter(d => d.status === 'pending').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('withdrawals')}
                className="w-full flex items-center justify-between p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ArrowDownCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Review Payouts</span>
                </div>
                {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">
                    {withdrawals.filter(w => w.status === 'pending').length}
                  </span>
                )}
              </button>
              <button 
                onClick={clearDemoData}
                className="w-full flex items-center gap-3 p-4 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-2xl transition-all text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Reset Demo Data</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#CE1126]/20 via-[#FCD116]/10 to-[#009E49]/20 border border-white/10 rounded-[32px] p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">System Status</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">All Systems Operational</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/40">
                  <span>Server Load</span>
                  <span>12%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[12%] h-full bg-green-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'deposits', label: 'Deposits', icon: ArrowUpCircle },
                { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownCircle },
                { id: 'activity', label: 'Activity', icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
              {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="p-6">User (Phone)</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Balance</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <UserRow key={user.uid} user={user} onUpdateBalance={updateUserBalance} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="p-6">User</th>
                    <th className="p-6">Amount</th>
                    <th className="p-6">Method</th>
                    <th className="p-6">Ref/ID</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Timestamp</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deposits.map(req => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 text-xs">{req.userId}</td>
                      <td className="p-6 font-bold text-green-400">{req.amount} ETB</td>
                      <td className="p-6 uppercase text-[10px] font-bold">{req.method}</td>
                      <td className="p-6 font-mono text-[10px] text-white/40">{req.transactionId}</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase ${req.status === 'approved' ? 'bg-green-600/20 text-green-400' : req.status === 'rejected' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-6 text-[10px] text-white/40">
                        {new Date(req.timestamp).toLocaleString()}
                      </td>
                      <td className="p-6">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleDepositAction(req.id, 'approved')} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleDepositAction(req.id, 'rejected')} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="p-6">User</th>
                    <th className="p-6">Amount</th>
                    <th className="p-6">Method</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Timestamp</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map(req => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 text-xs">{req.userId}</td>
                      <td className="p-6 font-bold text-blue-400">{req.amount} ETB</td>
                      <td className="p-6 uppercase text-[10px] font-bold">{req.method}</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase ${req.status === 'approved' ? 'bg-green-600/20 text-green-400' : req.status === 'rejected' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-6 text-[10px] text-white/40">
                        {new Date(req.timestamp).toLocaleString()}
                      </td>
                      <td className="p-6">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleWithdrawalAction(req.id, 'approved')} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleWithdrawalAction(req.id, 'rejected')} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="p-6">User</th>
                    <th className="p-6">Bet</th>
                    <th className="p-6">Win</th>
                    <th className="p-6">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map(session => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 text-xs">{session.userId}</td>
                      <td className="p-6 font-mono">{session.bet} ETB</td>
                      <td className={`p-6 font-mono font-bold ${session.win > 0 ? 'text-[#009E49]' : 'text-white/20'}`}>
                        {session.win} ETB
                      </td>
                      <td className="p-6 text-[10px] text-white/30">
                        {new Date(session.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
}
