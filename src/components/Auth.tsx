import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, User, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { mockAuth, mockDb } from '../mockDb';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const validateEthiopianPhone = (phone: string) => {
    // Basic check for 09... or 07...
    const regex = /^(09|07)\d{8}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEthiopianPhone(phoneNumber)) {
      setError('Please enter a valid Ethiopian phone number (e.g. 0912345678 or 0712345678)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const uid = '251' + phoneNumber.substring(1); // Convert 09... to 2519...
    let profile = mockDb.getUser(uid);
    const isTargetAdmin = phoneNumber === '0952779456';

    if (isLogin) {
      setLoading(true);
      setTimeout(() => {
        if (!profile) {
          setError('Account not found. Please register first.');
          setLoading(false);
          return;
        }
        // In a real app, we'd verify the password here.
        // For demo, we just check admin password.
        if (isTargetAdmin && password !== 'Farhan1+1') {
          setError('Incorrect Admin Password.');
          setLoading(false);
          return;
        }
        
        const user = { uid, phoneNumber: profile.phoneNumber, displayName: profile.displayName };
        mockAuth.signIn(user);
        onAuthSuccess(user);
        setLoading(false);
      }, 1000);
    } else {
      // Registration flow
      if (profile) {
        setError('Account already exists. Please login.');
        return;
      }

      if (!showOtp) {
        // Step 1: Generate OTP and show OTP input
        setLoading(true);
        setTimeout(() => {
          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(newOtp);
          setShowOtp(true);
          setLoading(false);
          // In a real app, this would be sent via SMS. For demo, we alert it.
          alert(`DEMO ONLY: Your OTP is ${newOtp}`);
        }, 1000);
      } else {
        // Step 2: Verify OTP and register
        if (otp !== generatedOtp) {
          setError('Invalid OTP. Please try again.');
          return;
        }

        setLoading(true);
        setTimeout(() => {
          const isAdmin = isTargetAdmin;
          profile = {
            uid,
            phoneNumber: '+251' + phoneNumber.substring(1),
            email: isAdmin ? 'mamofar925@gmail.com' : undefined,
            displayName: isAdmin ? 'Admin' : `Player ${phoneNumber.slice(-4)}`,
            role: isAdmin ? 'admin' : 'user',
            balance: 1000, // Give 1000 ETB for demo purposes
            createdAt: new Date().toISOString()
          };
          mockDb.setUser(uid, profile);
          
          const user = { uid, phoneNumber: profile.phoneNumber, displayName: profile.displayName };
          mockAuth.signIn(user);
          onAuthSuccess(user);
          setLoading(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase">Royal<span className="text-yellow-500">Bet</span></h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-900/20 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#151515] border border-white/5 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${isLogin ? 'text-yellow-500 border-b-2 border-yellow-500 bg-white/5' : 'text-white/40 hover:text-white/80'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${!isLogin ? 'text-yellow-500 border-b-2 border-yellow-500 bg-white/5' : 'text-white/40 hover:text-white/80'}`}
            >
              Register
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
              <p className="text-xs text-white/40">
                {isLogin ? 'Enter your details to access your account.' : 'Join Ethiopia\'s premium betting platform.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Phone Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3 bg-white/5 border-r border-white/10 rounded-l-xl">
                    <span className="text-white/60 text-sm font-bold">+251</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-20 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-semibold text-white/60 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {!isLogin && showOtp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-semibold text-white/60 ml-1">OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500 transition-colors tracking-widest"
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-500 text-xs text-center">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 text-white py-4 rounded-xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin ? 'Login' : (!showOtp ? 'Send OTP' : 'Verify & Register')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {isLogin && (
                  <div className="mt-6 text-center">
                    <a href="#" className="text-xs text-white/40 hover:text-yellow-500 transition-colors">Forgot Password?</a>
                  </div>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
