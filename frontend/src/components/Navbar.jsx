import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Heart, 
  ListMusic, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-zenvy-violet/15 text-zenvy-violetLight border border-zenvy-violet/30 shadow-sm'
        : 'text-zinc-400 hover:text-white hover:bg-zenvy-card'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-zenvy-dark/80 backdrop-blur-md border-b border-zenvy-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenvy-violet to-zenvy-violetDark flex items-center justify-center shadow-lg shadow-zenvy-violet/25 group-hover:scale-105 transition-transform duration-200">
              <Radio className="w-5 h-5 text-white animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zenvy-violetLight bg-clip-text text-transparent">
                ZENVY
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-zenvy-muted font-normal tracking-wide">
                Find Your Frequency
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass}>
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </NavLink>
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="w-4 h-4" />
              <span>Favorites</span>
            </NavLink>
            <NavLink to="/playlists" className={navLinkClass}>
              <ListMusic className="w-4 h-4" />
              <span>Playlists</span>
            </NavLink>
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zenvy-card border border-zenvy-border">
                  <div className="w-6 h-6 rounded-full bg-zenvy-violet/20 text-zenvy-violet flex items-center justify-center text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-zinc-200 max-w-[120px] truncate">
                    {user?.username || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zenvy-card border border-transparent hover:border-zenvy-border transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zenvy-card transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-zenvy-violet hover:bg-zenvy-violetDark text-white transition-all shadow-md shadow-zenvy-violet/20 hover:scale-[1.02]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zenvy-card border border-zenvy-border"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zenvy-border bg-zenvy-dark/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            <Compass className="w-4 h-4" />
            <span>Discover</span>
          </NavLink>
          <NavLink
            to="/favorites"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            <Heart className="w-4 h-4" />
            <span>Favorites</span>
          </NavLink>
          <NavLink
            to="/playlists"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            <ListMusic className="w-4 h-4" />
            <span>Playlists</span>
          </NavLink>

          <div className="pt-3 border-t border-zenvy-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-zenvy-muted">
                  Signed in as <strong className="text-white">{user?.username}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-zenvy-card text-zinc-200 border border-zenvy-border"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-zenvy-violet text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

