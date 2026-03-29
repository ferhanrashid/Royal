import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, Play, RotateCcw, Settings, X, Home, FlaskConical, Gamepad2, Info, Trophy, Wallet as WalletIcon, ShieldCheck, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { mockDb } from '../mockDb';
import Wallet from './Wallet';

const SYMBOLS = [
  { id: 'seven', type: 'text', text: '7', bg: 'bg-[#1a0b2e]', border: 'border-yellow-400', color: 'text-red-600', value: 50 },
  { id: 'watermelon', type: 'emoji', char: '🍉', value: 15 },
  { id: 'plum', type: 'emoji', char: '🍑', value: 10 },
  { id: 'orange', type: 'emoji', char: '🍊', value: 8 },
  { id: 'lemon', type: 'emoji', char: '🍋', value: 5 },
  { id: 'cherry', type: 'emoji', char: '🍒', value: 3 },
  { id: 'wild', type: 'text', text: 'WILD', bg: 'bg-gradient-to-br from-red-600 to-orange-600', color: 'text-yellow-400 font-black', value: 100 },
  { id: 'scatter', type: 'text', text: 'BONUS', bg: 'bg-blue-900', color: 'text-blue-400 font-black', value: 20 },
];

const SYMBOL_WEIGHTS = [3, 8, 12, 20, 25, 27, 1, 4]; // Must sum to 100

const getWeightedRandomSymbol = () => {
  const random = Math.random() * 100;
  let sum = 0;
  for (let i = 0; i < SYMBOL_WEIGHTS.length; i++) {
    sum += SYMBOL_WEIGHTS[i];
    if (random < sum) return i;
  }
  return SYMBOL_WEIGHTS.length - 1;
};


const PAYLINES = [
  [1, 1, 1, 1, 1], // Line 1 (Middle)
  [0, 0, 0, 0, 0], // Line 2 (Top)
  [2, 2, 2, 2, 2], // Line 3 (Bottom)
  [0, 1, 2, 1, 0], // Line 4 (V)
  [2, 1, 0, 1, 2], // Line 5 (Inverted V)
  [0, 0, 1, 2, 2], // Line 6
  [2, 2, 1, 0, 0], // Line 7
  [1, 2, 2, 2, 1], // Line 8
  [1, 0, 0, 0, 1], // Line 9
  [0, 1, 1, 1, 0], // Line 10
  [2, 1, 1, 1, 2], // Line 11
  [0, 1, 0, 1, 0], // Line 12
  [2, 1, 2, 1, 2], // Line 13
  [1, 0, 1, 0, 1], // Line 14
  [1, 2, 1, 2, 1]  // Line 15
];

const CountUp = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count.toFixed(2)}</>;
};

export default function SlotMachine({ user, onLogout, onNavigate, gameMode }: { user: any, onLogout: () => void, onNavigate: (view: 'sports' | 'casino') => void, gameMode: 'demo' | 'real' }) {
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(7.50);
  const [reels, setReels] = useState([
    [0, 1, 2],
    [3, 4, 0],
    [0, 2, 4],
    [1, 3, 0],
    [2, 4, 0]
  ]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winningSymbols, setWinningSymbols] = useState<Set<string>>(new Set());
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showPaylines, setShowPaylines] = useState(false);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [ambientSound, setAmbientSound] = useState(true);
  const [effectsSound, setEffectsSound] = useState(true);
  const [quickSpin, setQuickSpin] = useState(false);

  const [stoppedReels, setStoppedReels] = useState([false, false, false, false, false]);

  const adjustBet = (amount: number) => {
    const newBet = Math.max(1, bet + amount);
    if (newBet <= balance) {
      setBet(newBet);
    }
  };

  const handleSpin = () => {
    if (gameMode === 'real') {
      if (balance < bet) {
        setShowInsufficientFunds(true);
      } else {
        spin();
      }
    } else {
      spin();
    }
  };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const updateBalance = () => {
    const profile = mockDb.getUser(user.uid);
    if (profile) {
      setBalance(gameMode === 'real' ? profile.balance : profile.demoBalance);
    }
  };

  useEffect(() => {
    updateBalance();
    const interval = setInterval(updateBalance, 3000);
    return () => clearInterval(interval);
  }, [gameMode, user.uid]);

  useEffect(() => {
    updateBalance();
    
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    bgMusicRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/11/22/audio_d1718ab41b.mp3?filename=casino-ambience-123016.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, [user.uid]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (ambientSound && bgMusicRef.current) {
        bgMusicRef.current.play().catch(e => console.log("Audio play prevented:", e));
      }
      window.removeEventListener('click', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    
    if (ambientSound && bgMusicRef.current) {
      bgMusicRef.current.play().catch(e => console.log("Audio play prevented:", e));
    } else if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [ambientSound]);

  const playSoundEffect = (frequency: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1, fadeOut: boolean = true) => {
    if (!effectsSound || !audioCtxRef.current) return;
    
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    
    gain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + duration);
    }
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  };

  const playClickSound = () => playSoundEffect(800, 'sine', 0.05, 0.05);
  
  const playReelStopSound = () => {
    // A low thud for reel stopping
    playSoundEffect(150, 'triangle', 0.1, 0.1);
    playSoundEffect(50, 'sine', 0.1, 0.2);
  };

  const playWinSound = (isBigWin: boolean = false) => {
    if (!effectsSound || !audioCtxRef.current) return;
    
    if (isBigWin) {
      // Epic big win sound
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playSoundEffect(freq, 'square', 0.2, 0.05);
          playSoundEffect(freq * 1.01, 'sawtooth', 0.2, 0.02);
        }, i * 100);
      });
      // Add some "bells"
      setTimeout(() => {
        for(let i = 0; i < 10; i++) {
          setTimeout(() => playSoundEffect(2000 + (i * 100), 'sine', 0.1, 0.03), i * 50);
        }
      }, 800);
    } else {
      // Happy small win
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        setTimeout(() => playSoundEffect(freq, 'triangle', 0.15, 0.05), i * 100);
      });
    }
  };
  
  const playLoseSound = () => {
    // Short descending low sound
    [200, 150, 100].forEach((freq, i) => {
      setTimeout(() => playSoundEffect(freq, 'sawtooth', 0.1, 0.03), i * 80);
    });
  };
  
  const playSpinSound = () => {
    // Mechanical tick
    playSoundEffect(1200, 'sine', 0.02, 0.01);
  };

  const spin = async () => {
    if (spinning) return;
    
    let currentBalance = balance;
    if (currentBalance < bet) {
      if (gameMode === 'demo') {
        currentBalance += 1000;
        setBalance(currentBalance);
        mockDb.setUser(user.uid, { demoBalance: currentBalance });
      } else {
        // Professional low balance prompt
        const confirmDeposit = window.confirm("Insufficient funds for this bet. Would you like to deposit more?");
        if (confirmDeposit) {
          setShowWallet(true);
        }
        return;
      }
    }

    // Start spin sound
    playSoundEffect(400, 'sawtooth', 0.1, 0.02);
    setSpinning(true);
    setLastWin(0);
    setWinningSymbols(new Set());
    setStoppedReels([false, false, false, false, false]);

    const newBalance = currentBalance - bet;
    setBalance(newBalance);
    if (gameMode === 'real') {
      mockDb.setUser(user.uid, { balance: newBalance });
    } else {
      mockDb.setUser(user.uid, { demoBalance: newBalance });
    }

    const spinDuration = quickSpin ? 800 : 2000;
    const startTime = Date.now();
    
    const finalReels = [
      [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
      [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
      [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
      [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
      [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()]
    ];
    
    const tempStoppedReels = [false, false, false, false, false];
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      playSpinSound();
      
      setReels(prevReels => prevReels.map((reel, i) => {
        const stopTime = spinDuration + (i * (quickSpin ? 100 : 300));
        if (elapsed > stopTime) {
          if (!tempStoppedReels[i]) {
            tempStoppedReels[i] = true;
            playReelStopSound();
            setStoppedReels(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }
          return finalReels[i];
        }
        return [
          getWeightedRandomSymbol(),
          getWeightedRandomSymbol(),
          getWeightedRandomSymbol()
        ];
      }));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setReels(finalReels);
      setSpinning(false);

      let winAmount = 0;
      const winners = new Set<string>();
      
      PAYLINES.forEach(line => {
        let firstSymbolIdx = finalReels[0][line[0]];
        let matchSymbolId = SYMBOLS[firstSymbolIdx].id;
        let count = 1;
        const currentLineWinners = [`0-${line[0]}`];
        
        // If first symbol is wild, we need to find the first non-wild symbol to match against
        if (matchSymbolId === 'wild') {
          for (let col = 1; col < 5; col++) {
            const symId = SYMBOLS[finalReels[col][line[col]]].id;
            if (symId !== 'wild') {
              matchSymbolId = symId;
              break;
            }
          }
        }

        for (let col = 1; col < 5; col++) {
          const row = line[col];
          const symId = SYMBOLS[finalReels[col][row]].id;
          if (symId === matchSymbolId || symId === 'wild') {
            count++;
            currentLineWinners.push(`${col}-${row}`);
          } else {
            break;
          }
        }

        if (count >= 3) {
          const winSymbol = SYMBOLS.find(s => s.id === matchSymbolId) || SYMBOLS.find(s => s.id === 'wild')!;
          winAmount += bet * winSymbol.value * (count - 2);
          currentLineWinners.forEach(w => winners.add(w));
        }
      });

      if (winAmount > 0) {
        setWinningSymbols(winners);
        setLastWin(winAmount);
        const updatedBalance = newBalance + winAmount;
        setBalance(updatedBalance);
        if (gameMode === 'real') {
          mockDb.setUser(user.uid, { balance: updatedBalance });
        } else {
          mockDb.setUser(user.uid, { demoBalance: updatedBalance });
        }
        playWinSound(winAmount >= bet * 10);
        if (winAmount >= bet * 10) {
          setShowWinnerOverlay(true);
          setTimeout(() => setShowWinnerOverlay(false), 3000);
        }
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF00FF', '#00FFFF', '#FFFF00']
        });
      } else {
        playLoseSound();
      }

      mockDb.addSession({
        userId: user.uid,
        bet,
        win: winAmount,
        reels: finalReels,
        mode: gameMode
      });
    }, spinDuration + (quickSpin ? 500 : 1500));
  };

  const renderSymbol = (symbolIdx: number, isWinner: boolean, isSpinning: boolean, reelIdx: number) => {
    const sym = SYMBOLS[symbolIdx];
    if (!sym) return null;
    
    const isStopped = stoppedReels[reelIdx];
    const baseClasses = `w-full h-full flex items-center justify-center rounded-xl symbol-glossy relative overflow-hidden ${isWinner ? 'animate-win-pulse z-10' : ''} ${isSpinning ? 'animate-spin-blur' : ''} ${['seven', 'wild'].includes(sym.id) ? 'animate-hot-symbol' : ''}`;
    
    return (
      <motion.div 
        animate={isStopped ? { boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 20px rgba(255,255,255,0.8)', '0 0 0px rgba(255,255,255,0)'] } : {}}
        transition={{ duration: 0.5 }}
        className={baseClasses}
      >
        {sym.id === 'seven' ? (
          <div className="w-full h-full flex items-center justify-center bg-[#1a0b2e] border-2 border-yellow-400/50 shadow-[inset_0_0_10px_rgba(250,204,21,0.4)]">
            <div className="glossy-overlay absolute inset-0"></div>
            <span className="text-red-600 font-black text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-10" style={{ WebkitTextStroke: '2px #facc15' }}>7</span>
          </div>
        ) : sym.id === 'wild' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-600 border-2 border-yellow-400 shadow-[inset_0_0_15px_rgba(250,204,21,0.6)]">
            <div className="glossy-overlay absolute inset-0"></div>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-white font-black text-3xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10" style={{ WebkitTextStroke: '1px #b45309' }}>WILD</span>
          </div>
        ) : sym.id === 'scatter' ? (
          <div className="w-full h-full flex items-center justify-center bg-blue-900 border-2 border-blue-400 shadow-[inset_0_0_15px_rgba(96,165,250,0.6)]">
            <div className="glossy-overlay absolute inset-0"></div>
            <span className="text-blue-400 font-black text-2xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10" style={{ WebkitTextStroke: '1px #60a5fa' }}>BONUS</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="glossy-overlay absolute inset-0 rounded-full opacity-50"></div>
            <span className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-10">{sym.char}</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans relative flex flex-col items-center justify-between pb-20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-panel via-bg-app to-black opacity-90"></div>
        {/* Glowing streaks - toned down */}
        <div className="absolute top-[15%] w-full h-1 bg-accent/20 blur-sm animate-streak"></div>
        <div className="absolute top-[30%] w-full h-1 bg-accent/20 blur-sm animate-streak" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Section */}
      <div className="relative z-10 w-full flex flex-col items-center pt-8 pb-2">
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('sports')}
          className="absolute top-4 left-4 p-2 bg-panel border border-border rounded-full hover:bg-border transition-colors z-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center relative border border-border rounded-2xl px-8 py-4 shadow-lg bg-panel backdrop-blur-sm">
          {/* Game Mode Badge */}
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${gameMode === 'real' ? 'bg-accent text-white' : 'bg-emerald-600 text-white'}`}>
            {gameMode === 'real' ? 'Real Mode' : 'Demo Mode'}
          </div>

          <h1 className="text-4xl font-serif italic text-text-primary -mb-1">Hot Hot</h1>
          <h2 className="text-5xl font-black text-accent tracking-tighter">FRUIT</h2>
        </div>

        {/* Jackpot Race */}
        <div className="mt-4 text-center">
          <p className="text-yellow-400 font-bold text-sm neon-text-gold tracking-widest italic">Jackpot Race™</p>
          <div className="mt-1 px-8 py-1 rounded-full border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] bg-black/50 backdrop-blur-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <p className="text-white font-bold text-sm">in 1d 17h 3m</p>
          </div>
        </div>
      </div>

      {/* Main Slot Area */}
      <div className="relative z-10 w-full max-w-md px-6 flex-1 flex flex-col justify-center">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-orange-300 font-black text-xl tracking-widest drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]">
          <span>H</span><span>O</span><span>T</span>
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-orange-300 font-black text-xl tracking-widest drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]">
          <span>H</span><span>O</span><span>T</span>
        </div>
        
        <div className="bg-panel rounded-2xl border border-border p-2 shadow-2xl relative">
          <div className="grid grid-cols-5 gap-1 h-[280px]">
            {reels.map((reel, i) => (
              <div key={i} className="flex flex-col gap-1 overflow-hidden bg-black/20 rounded-lg relative">
                {reel.map((symbolIdx, j) => {
                  const isWinner = winningSymbols.has(`${i}-${j}`);
                  return (
                    <div key={`${i}-${j}`} className="flex-1 relative">
                      {renderSymbol(symbolIdx, isWinner, spinning, i)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Win Overlay */}
          <AnimatePresence>
            {lastWin > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="bg-panel/90 border border-accent px-8 py-4 rounded-xl shadow-2xl backdrop-blur-md">
                  <h3 className="text-2xl font-bold text-accent mb-1">BIG WIN</h3>
                  <p className="text-4xl font-black text-white"><CountUp value={lastWin} /></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Area */}
      <div className="relative z-10 w-full pb-0 pt-2 flex flex-col items-center gap-4">
        {/* Spin Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Coins Button */}
          <button className="w-12 h-12 rounded-full bg-panel border border-border flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Coins className="w-6 h-6 text-text-secondary" />
          </button>

          {/* Spin Button */}
          <button 
            onClick={handleSpin}
            disabled={spinning}
            className="w-20 h-20 rounded-full bg-accent hover:bg-accent/90 border-4 border-black flex items-center justify-center shadow-xl active:scale-95 transition-transform relative overflow-hidden disabled:opacity-50"
          >
            {spinning ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            )}
          </button>

          {/* Auto Spin Button */}
          <button className="w-12 h-12 rounded-full bg-panel border border-border flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <RotateCcw className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Royal Games Logo */}
        <div className="flex items-center gap-2 opacity-80 mt-2">
          <div className="w-4 h-4 bg-yellow-500 flex items-center justify-center rounded-sm">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <span className="text-white font-black text-xs tracking-widest uppercase">Royal Games™</span>
        </div>

        {/* Bottom Bar */}
        <div className="w-full bg-panel border-t border-border px-4 py-3 flex justify-between items-center mt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSettings(true)} className="p-2 active:scale-90 transition-transform text-text-secondary hover:text-text-primary">
              <Settings className="w-6 h-6" />
            </button>
            <button onClick={() => setShowWallet(true)} className="flex flex-col text-left group">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-text-secondary uppercase">{gameMode === 'real' ? 'Real' : 'Demo'} Balance</span>
                <WalletIcon className="w-3 h-3 text-accent" />
              </div>
              <span className="text-text-primary font-bold text-lg">{balance.toFixed(2)} ETB</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-secondary uppercase">Bet</span>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustBet(-1)} className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-text-primary font-bold">-</button>
                <span className="text-text-primary font-bold text-lg">{bet.toFixed(2)} ETB</span>
                <button onClick={() => adjustBet(1)} disabled={bet + 1 > balance} className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-text-primary font-bold disabled:opacity-50">+</button>
              </div>
            </div>
            <button onClick={() => setShowPaylines(true)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-secondary text-xs font-bold active:scale-90 transition-transform">
              i
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111] border-t border-white/10 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => onNavigate('sports')}
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors"
        >
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sports</span>
        </button>
        <button 
          onClick={() => onNavigate('casino')}
          className="flex flex-col items-center gap-1 text-yellow-500"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">777</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Casino</span>
        </button>
      </div>

      {/* Insufficient Funds Modal */}
      <AnimatePresence>
        {showInsufficientFunds && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-[#111] border border-red-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-widest text-white mb-2">Insufficient Funds</h3>
              <p className="text-white/60 text-sm mb-6">You don't have enough balance to place this bet. Please deposit more funds.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowInsufficientFunds(false)} 
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { setShowInsufficientFunds(false); setShowWallet(true); }} 
                  className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Deposit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-black/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Game Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex justify-around mb-8">
              <button onClick={onLogout} className="flex flex-col items-center gap-2 text-accent hover:text-red-400 active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-panel border border-accent flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <span className="text-xs">Logout</span>
              </button>
              <button onClick={() => setShowSettings(false)} className="flex flex-col items-center gap-2 text-text-secondary hover:text-text-primary active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-panel border border-border flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-xs">Lobby</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <span className="text-xs">Test Features</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="text-xs">More Games!</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white">Sound - Ambient</span>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle-ambient" id="toggle-ambient" checked={ambientSound} onChange={() => setAmbientSound(!ambientSound)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label htmlFor="toggle-ambient" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white">Sound - Effects</span>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle-effects" id="toggle-effects" checked={effectsSound} onChange={() => setEffectsSound(!effectsSound)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label htmlFor="toggle-effects" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white">Quick Spin</span>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle-quick" id="toggle-quick" checked={quickSpin} onChange={() => setQuickSpin(!quickSpin)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label htmlFor="toggle-quick" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Wallet Modal */}
      {showWallet && (
        <Wallet 
          user={user} 
          onClose={() => setShowWallet(false)} 
          onUpdateBalance={updateBalance} 
        />
      )}

      {/* Paylines Modal */}
      <AnimatePresence>
        {showPaylines && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest text-white">Paylines</h3>
                <button onClick={() => setShowPaylines(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Symbol Payouts</h4>
                  <div className="grid grid-cols-3 gap-4 text-white/70 text-xs">
                    {SYMBOLS.map(sym => (
                      <div key={sym.id} className="flex items-center gap-2">
                        <span className="text-2xl">{sym.type === 'emoji' ? sym.char : sym.text}</span>
                        <span>= {sym.value}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Paylines (15 Total)</h4>
                  <p className="text-xs text-white/50 mb-4">Match 3+ symbols on any of the 15 active paylines to win!</p>
                  <div className="grid grid-cols-5 gap-1 w-32 mx-auto">
                    {PAYLINES.slice(0, 3).map((line, i) => (
                      <React.Fragment key={i}>
                        {[0, 1, 2, 3, 4].map(col => (
                          <div key={col} className={`w-5 h-5 rounded-sm ${line[col] === 0 ? 'bg-red-500' : line[col] === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Overlay */}
      <AnimatePresence>
        {showWinnerOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-9xl font-black italic text-yellow-400 neon-text-gold"
            >
              WINNER!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
