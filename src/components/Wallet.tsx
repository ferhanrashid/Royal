import React, { useState } from 'react';
import { mockDb } from '../mockDb';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Wallet({ user, onBack, onClose, onUpdateBalance }: { user: any, onBack?: () => void, onClose?: () => void, onUpdateBalance?: () => void }) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [balance, setBalance] = useState(user.balance || 0);

  const refreshBalance = () => {
    const profile = mockDb.getUser(user.uid);
    if (profile) setBalance(profile.balance);
  };

  React.useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    if (onClose) onClose();
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }
    
    if (!transactionId.trim()) {
      setStatus({ type: 'error', message: 'Please enter the Telebirr transaction ID.' });
      return;
    }

    mockDb.addDepositRequest({
      userId: user.uid,
      amount: numAmount,
      method: 'telebirr',
      transactionId: transactionId.trim()
    });

    setStatus({ type: 'success', message: 'Deposit request submitted successfully! Pending admin approval.' });
    setAmount('');
    setTransactionId('');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    const currentUser = mockDb.getUser(user.uid);
    if (!currentUser || currentUser.balance < numAmount) {
      setStatus({ type: 'error', message: 'Insufficient balance for this withdrawal.' });
      return;
    }

    if (!phoneNumber.trim()) {
      setStatus({ type: 'error', message: 'Please enter your Telebirr phone number.' });
      return;
    }

    const success = mockDb.addWithdrawalRequest({
      userId: user.uid,
      amount: numAmount,
      method: 'telebirr',
      phoneNumber: phoneNumber.trim()
    });

    if (success) {
      setStatus({ type: 'success', message: 'Withdrawal request submitted successfully! Pending admin approval.' });
      setAmount('');
    } else {
      setStatus({ type: 'error', message: 'Failed to submit withdrawal request. Please check your balance.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Wallet</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Manage your funds</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Real Balance</p>
            <p className="text-2xl font-black text-yellow-500">{balance.toFixed(2)} ETB</p>
          </div>
        </header>

        <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl p-6 md:p-8">
          <div className="flex gap-2 bg-black/50 p-1 rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => { setActiveTab('deposit'); setStatus(null); setAmount(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase font-bold tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Deposit
            </button>
            <button
              onClick={() => { setActiveTab('withdraw'); setStatus(null); setAmount(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase font-bold tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Withdraw
            </button>
          </div>

          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-red-600/20 text-red-400 border border-red-600/30'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          {activeTab === 'deposit' ? (
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-200/80">
                <p className="font-bold text-yellow-500 mb-2 uppercase tracking-widest text-[10px]">Instructions</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Send the desired amount via Telebirr to <strong className="text-white">0952779456</strong></li>
                  <li>Copy the Transaction ID from Telebirr (Use <strong className="text-white">Farre09</strong> for demo)</li>
                  <li>Enter the amount and Transaction ID below</li>
                  <li>Wait for admin approval</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Amount (ETB)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-green-500 transition-colors text-lg font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Telebirr Transaction ID</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 7A8B9C0D"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-green-500 transition-colors font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase italic tracking-widest transition-colors"
              >
                Submit Deposit Request
              </button>
            </form>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200/80">
                <p className="font-bold text-blue-500 mb-2 uppercase tracking-widest text-[10px]">Information</p>
                <p>Withdrawals are processed to your Telebirr account. Please ensure your phone number is correct.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Amount (ETB)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors text-lg font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Telebirr Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase italic tracking-widest transition-colors"
              >
                Submit Withdrawal Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
