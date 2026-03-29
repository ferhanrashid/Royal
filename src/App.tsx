import React, { useState, useEffect } from 'react';
import { mockAuth, mockDb } from './mockDb';
import Auth from './components/Auth';
import SlotMachine from './components/SlotMachine';
import Admin from './components/Admin';
import Sportsbook from './components/Sportsbook';
import Wallet from './components/Wallet';
import History from './components/History';
import { ShieldCheck, ExternalLink, Wallet as WalletIcon, Send, History as HistoryIcon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'sports' | 'casino' | 'admin' | 'wallet' | 'history'>('sports');
  const [gameMode, setGameMode] = useState<'demo' | 'real'>(() => (localStorage.getItem('royal_games_mode') as 'demo' | 'real') || 'demo');

  useEffect(() => {
    localStorage.setItem('royal_games_mode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/royalgames/admin' || path === '/royalgames/admin/') {
      setView('admin');
    }
  }, []);

  useEffect(() => {
    mockAuth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        const profile = mockDb.getUser(u.uid);
        if (profile) {
          setRole(profile.role);
        }
      } else {
        setUser(null);
        setRole('user');
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    mockAuth.signOut();
    setUser(null);
    setRole('user');
    setView('sports');
  };

  const forceAdmin = () => {
    const adminUser = { uid: '251952779456', phoneNumber: '+251952779456', email: 'mamofar925@gmail.com', displayName: 'Admin' };
    mockDb.setUser(adminUser.uid, { ...adminUser, role: 'admin', balance: 999999, createdAt: new Date().toISOString() });
    mockAuth.signIn(adminUser);
    setUser(adminUser);
    setRole('admin');
    setView('admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] animate-pulse">Initializing RoyalBet</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Telegram Channel Link */}
      <a
        href="https://t.me/royalbettingss"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 px-3 py-1 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-full text-[8px] uppercase font-bold tracking-widest transition-all shadow-lg"
      >
        <Send className="w-2.5 h-2.5" />
        Join Telegram
      </a>

      {user && view !== 'admin' && view !== 'wallet' && view !== 'history' && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-4">
          <button
            onClick={() => setView('wallet')}
            className="bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group relative"
          >
            <WalletIcon className="w-6 h-6" />
            <span className="absolute right-full mr-4 px-3 py-1 bg-black/80 text-white text-[10px] uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Wallet</span>
          </button>
          <button
            onClick={() => setView('history')}
            className="bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group relative"
          >
            <HistoryIcon className="w-6 h-6" />
            <span className="absolute right-full mr-4 px-3 py-1 bg-black/80 text-white text-[10px] uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">History</span>
          </button>
        </div>
      )}

      {!user ? (
        <Auth onAuthSuccess={(u) => {
          setUser(u);
          const profile = mockDb.getUser(u.uid);
          if (profile) setRole(profile.role);
        }} />
      ) : view === 'sports' ? (
        <Sportsbook user={user} onLogout={handleLogout} onNavigate={setView} gameMode={gameMode} setGameMode={setGameMode} />
      ) : view === 'casino' ? (
        <SlotMachine user={user} onLogout={handleLogout} onNavigate={setView} gameMode={gameMode} />
      ) : view === 'wallet' ? (
        <Wallet user={user} onBack={() => setView('sports')} />
      ) : view === 'history' ? (
        <History user={user} onBack={() => setView('sports')} />
      ) : (
        <Admin onBack={() => {
          window.history.pushState({}, '', '/');
          setView('sports');
        }} />
      )}
    </div>
  );
}
