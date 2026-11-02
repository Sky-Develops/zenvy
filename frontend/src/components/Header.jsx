import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  LogOut, 
  Menu 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onOpenOmnibar, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-zenvy-obsidian border-b border-zenvy-border px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Kiri: Navigasi Riwayat & Toggle Menu Mobile */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-zenvy-card text-zinc-400 hover:text-white border border-zenvy-border"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-center text-zinc-400 hover:text-white transition"
            title="Kembali"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-center text-zinc-400 hover:text-white transition"
            title="Maju"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tengah: Omnibar Pencarian Cepat */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenOmnibar}
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border hover:border-zinc-500 text-xs sm:text-sm text-zenvy-muted hover:text-zinc-300 transition shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
            <span className="truncate">Cari lagu, musisi, atau genre...</span>
          </div>
          <kbd className="hidden sm:inline-block text-[11px] font-mono bg-zenvy-obsidian px-2 py-0.5 rounded border border-zenvy-border text-zinc-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Kanan: Profil Pengguna */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zenvy-card border border-zenvy-border">
              <div className="w-6 h-6 rounded-full bg-zenvy-violet flex items-center justify-center text-[11px] font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white truncate max-w-[110px] leading-tight">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-zinc-400 leading-none">Pengguna</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar"
              className="p-2 rounded-lg bg-zenvy-card text-zinc-400 hover:text-red-400 hover:bg-zenvy-cardElevated border border-zenvy-border transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zenvy-violet hover:bg-purple-700 transition"
            >
              Masuk
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
