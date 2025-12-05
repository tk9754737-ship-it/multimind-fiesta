'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('Password reset link sent to your email!');
        setIsForgotPassword(false);
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">

      {/* Animated Glowing Orbs – Exact AI Fiesta Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl ring-1 ring-white/20 shadow-purple-500/30">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-purple-500/60">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-center text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
            MultiMind
          </h1>
          <p className="text-center text-gray-400 mt-3 text-lg">Sign in to continue</p>

          <div className="mt-10 space-y-6">

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-xl text-white font-medium transition-all active:scale-98 shadow-lg hover:shadow-purple-500/40"
            >
              <FcGoogle className="w-6 h-6" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-black text-gray-500">or</span></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && !isForgotPassword && (
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 placeholder-gray-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/30 outline-none transition" />
              )}

              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 placeholder-gray-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/30 outline-none transition" />

              {!isForgotPassword && (
                <div className="relative">
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 placeholder-gray-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/30 outline-none transition" />
                  {isLogin && (
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300">
                      Forgot?
                    </button>
                  )}
                </div>
              )}

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
              {message && <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 shadow-xl active:scale-98 transition-all disabled:opacity-60"
              >
                {loading ? "Please wait..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center mt-8 text-gray-400">
              {isLogin ? "New here? " : "Already have an account? "}
              <button type="button" onClick={() => { setIsForgotPassword(false); setIsLogin(!isLogin); }} className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
