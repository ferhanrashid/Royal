import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, ChevronRight, Search, Activity, Flame, ShieldCheck, User, Wallet as WalletIcon } from 'lucide-react';
import { mockDb } from '../mockDb';
import Wallet from './Wallet';

const MOCK_EVENTS = [
  {
    id: '1',
    league: 'Ethiopian Premier League',
    homeTeam: 'St. George SA',
    awayTeam: 'Ethiopian Coffee',
    time: 'Today, 18:00',
    status: 'live',
    score: '1 - 0',
    minute: '45\'',
    odds: { home: 1.45, draw: 3.20, away: 4.50 }
  },
  {
    id: '2',
    league: 'English Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Manchester City',
    time: 'Tomorrow, 16:30',
    status: 'upcoming',
    odds: { home: 2.80, draw: 3.40, away: 2.30 }
  },
  {
    id: '3',
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern Munich',
    time: 'Wed, 20:00',
    status: 'upcoming',
    odds: { home: 2.10, draw: 3.50, away: 3.10 }
  },
  {
    id: '4',
    league: 'Ethiopian Premier League',
    homeTeam: 'Fasil Kenema',
    awayTeam: 'Bahir Dar Kenema',
    time: 'Today, 20:00',
    status: 'upcoming',
    odds: { home: 1.95, draw: 3.10, away: 3.80 }
  }
];

export default function Sportsbook({ user, onLogout, onNavigate, gameMode, setGameMode }: { user: any, onLogout: () => void, onNavigate: (view: 'sports' | 'casino') => void, gameMode: 'demo' | 'real', setGameMode: (mode: 'demo' | 'real') => void }) {
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [showWallet, setShowWallet] = useState(false);

  const updateBalance = () => {
    const profile = mockDb.getUser(user.uid);
    if (profile) {
      setBalance(gameMode === 'real' ? profile.balance : profile.demoBalance);
    }
  };

  React.useEffect(() => {
    updateBalance();
  }, [user.uid, gameMode]);

  const liveEvents = MOCK_EVENTS.filter(e => e.status === 'live');
  const upcomingEvents = MOCK_EVENTS.filter(e => e.status === 'upcoming');
  const displayEvents = activeTab === 'live' ? liveEvents : upcomingEvents;

  return (
    <div className="h-auto bg-[#0a0a0a] text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-black italic text-white tracking-tighter uppercase">Royal<span className="text-yellow-500">Bet</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setGameMode('demo')}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${gameMode === 'demo' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/40'}`}
            >
              Demo
            </button>
            <button 
              onClick={() => setGameMode('real')}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${gameMode === 'real' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/40'}`}
            >
              Real
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
          </div>
          <button 
            onClick={() => setShowWallet(true)}
            className="flex flex-col items-end group ml-auto"
          >
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">{gameMode === 'real' ? 'Real' : 'Demo'} Balance</p>
              <WalletIcon className="w-3 h-3 text-yellow-500" />
            </div>
            <p className="text-yellow-500 font-bold text-sm">{balance.toFixed(2)} ETB</p>
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 rounded-full transition-colors ml-4">
            <User className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Logout</span>
          </button>
        </div>
      </header>

      {/* Search & Categories */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search events, teams, leagues..." 
            className="w-full bg-[#151515] border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 rounded-full text-xs font-bold whitespace-nowrap">
            <Trophy className="w-4 h-4" /> Football
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#151515] border border-white/10 rounded-full text-xs font-bold whitespace-nowrap text-white/60 hover:text-white transition-colors">
            Basketball
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#151515] border border-white/10 rounded-full text-xs font-bold whitespace-nowrap text-white/60 hover:text-white transition-colors">
            Tennis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#151515] border border-white/10 rounded-full text-xs font-bold whitespace-nowrap text-white/60 hover:text-white transition-colors">
            Volleyball
          </button>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="px-4 mb-6">
        <div className="w-full h-32 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-white" />
              <span className="text-white font-black italic uppercase tracking-widest text-xs">Hot Match</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ethiopian Derby</h3>
              <p className="text-white/80 text-xs font-bold">St. George vs Ethiopian Coffee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-4 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('live')}
          className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'live' ? 'text-yellow-500' : 'text-white/40'}`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            Live Now
          </div>
          {activeTab === 'live' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'upcoming' ? 'text-yellow-500' : 'text-white/40'}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
          </div>
          {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500"></div>}
        </button>
      </div>

      {/* Event List */}
      <div className="px-4 space-y-4">
        {displayEvents.map(event => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#151515] border border-white/5 rounded-2xl p-4 shadow-md"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{event.league}</span>
              </div>
              {event.status === 'live' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500 animate-pulse">{event.minute}</span>
                  <Activity className="w-3 h-3 text-red-500" />
                </div>
              ) : (
                <span className="text-[10px] text-white/40">{event.time}</span>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <p className="font-bold text-sm">{event.homeTeam}</p>
                <p className="font-bold text-sm mt-1">{event.awayTeam}</p>
              </div>
              {event.status === 'live' && (
                <div className="flex flex-col items-end justify-center px-4">
                  <p className="font-black text-lg text-yellow-500">{event.score.split('-')[0].trim()}</p>
                  <p className="font-black text-lg text-yellow-500">{event.score.split('-')[1].trim()}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="bg-[#222] hover:bg-[#333] border border-white/5 rounded-xl py-2 flex flex-col items-center justify-center transition-colors">
                <span className="text-[10px] text-white/40 mb-1">1</span>
                <span className="font-bold text-sm text-white">{event.odds.home.toFixed(2)}</span>
              </button>
              <button className="bg-[#222] hover:bg-[#333] border border-white/5 rounded-xl py-2 flex flex-col items-center justify-center transition-colors">
                <span className="text-[10px] text-white/40 mb-1">X</span>
                <span className="font-bold text-sm text-white">{event.odds.draw.toFixed(2)}</span>
              </button>
              <button className="bg-[#222] hover:bg-[#333] border border-white/5 rounded-xl py-2 flex flex-col items-center justify-center transition-colors">
                <span className="text-[10px] text-white/40 mb-1">2</span>
                <span className="font-bold text-sm text-white">{event.odds.away.toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        ))}
        {displayEvents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-white/40 text-sm">No events found.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111] border-t border-white/10 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => onNavigate('sports')}
          className="flex flex-col items-center gap-1 text-yellow-500"
        >
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sports</span>
        </button>
        <button 
          onClick={() => onNavigate('casino')}
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">777</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Casino</span>
        </button>
      </div>
      {/* Wallet Modal */}
      {showWallet && (
        <Wallet 
          user={user} 
          onClose={() => setShowWallet(false)} 
          onUpdateBalance={updateBalance} 
        />
      )}

      {/* Telegram Button */}
      <a
        href="https://t.me/your_telegram_channel"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#0088cc] rounded-full flex items-center justify-center shadow-lg z-40 hover:scale-105 transition-transform"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1.01-.69 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.51-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.21-.02-.09.04-1.49.95-4.22 2.79-.4.27-.76.4-1.08.39-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.5 2.78-1.1 3.36-1.29 3.74-1.3.08 0 .27.02.37.1.09.07.12.17.13.27-.01.06-.01.12-.02.18z"/>
        </svg>
      </a>
    </div>
  );
}
