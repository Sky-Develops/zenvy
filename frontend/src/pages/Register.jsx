import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ZenvyLogo from '../components/ZenvyLogo';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      {/* Immersive Auth Card with Identity Design: Frosted Charcoal, Corner Glow, Glowing Tapered Bottom */}
      <div className="w-full max-w-md bg-[#1C1C1F]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        
        {/* Glow in top-right corner inside the card */}
        <div className="absolute -top-14 -right-14 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="flex justify-center mb-3">
            <ZenvyLogo size="md" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Create an Account</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5 relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121214] text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary transition shadow-inner"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up to ZENVY</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zenvy-muted relative z-10">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-zenvy-primary hover:underline font-semibold transition"
          >
            Log in now
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

export default Register;
