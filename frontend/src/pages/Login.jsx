import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ZenvyLogo from '../components/ZenvyLogo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      {/* Immersive Auth Card with Identity Design: Frosted Charcoal, Corner Glow, Glowing Tapered Bottom */}
      <div className="w-full max-w-md bg-[#1C1C1F]/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow in top-right corner inside the card */}
        <div className="absolute -top-14 -right-14 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <ZenvyLogo size="lg" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5 relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-zenvy-primary hover:bg-emerald-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Log In to ZENVY</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zenvy-muted relative z-10">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-zenvy-primary hover:underline font-semibold transition"
          >
            Sign up now
          </Link>
        </div>

        {/* Glowing bottom edge line: thick & luminous in the middle, fading to transparent at the left and right */}
        <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-3/4 h-3 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent blur-sm" />
          <div className="absolute w-1/2 h-1.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
          <div className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Login;
