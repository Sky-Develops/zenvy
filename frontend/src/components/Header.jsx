import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  LogOut, 
  LogIn,
  Menu,
  User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onOpenOmnibar, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#121214]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Left: Navigation History & Mobile Menu Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden w-9 h-9 rounded-xl bg-[#1E1E22] hover:bg-[#28282E] text-zinc-300 hover:text-white flex items-center justify-center transition shadow-sm"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg bg-[#1E1E22] hover:bg-[#28282E] flex items-center justify-center text-zinc-300 hover:text-white transition shadow-sm"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-lg bg-[#1E1E22] hover:bg-[#28282E] flex items-center justify-center text-zinc-300 hover:text-white transition shadow-sm"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Quick Search Omnibar with backdrop blur & elevated contrast */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenOmnibar}
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[#1C1C1F]/90 hover:bg-[#242428] backdrop-blur-md text-xs sm:text-sm text-zenvy-muted hover:text-zinc-200 transition shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#27272B] flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Search songs, artists, or genres...</span>
          </div>
          <kbd className="hidden sm:inline-block text-[11px] font-mono bg-[#121214] px-2 py-0.5 rounded text-zinc-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 text-zinc-300 bg-[#1C1C1F] px-2.5 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-zenvy-text truncate max-w-[120px]">
                {user?.username || 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-2 rounded-xl bg-[#1E1E22] text-zinc-400 hover:text-red-400 hover:bg-[#28282E] transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-zenvy-primary hover:bg-emerald-400 transition-colors duration-200 shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Log In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
