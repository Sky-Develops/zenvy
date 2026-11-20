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
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ZenvyLogo from './ZenvyLogo';

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
        ? 'bg-zenvy-elevated text-white font-semibold shadow-sm'
        : 'text-zenvy-muted hover:text-white hover:bg-zenvy-elevated'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-zenvy-obsidian border-b border-zenvy-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <ZenvyLogo />
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
                <div className="flex items-center gap-2 text-zinc-300">
                  <User className="w-4 h-4 text-zinc-400" />


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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#27272B] hover:bg-[#323238] text-white transition-all shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-zenvy-primary text-white transition-all hover:bg-emerald-400"
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
        <div className="md:hidden border-t border-zenvy-border bg-[#101014] px-4 pt-3 pb-5 space-y-2">
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
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-[#27272B] hover:bg-[#323238] text-white"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-zenvy-primary hover:bg-emerald-600 text-white"
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

