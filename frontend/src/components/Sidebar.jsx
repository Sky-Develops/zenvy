import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Search, 
  Heart, 
  ListMusic, 
  Radio, 
  Sparkles,
  PlusCircle,
  FolderHeart
} from 'lucide-react';
import { SONIC_HABITATS } from '../services/mockData';
import { playlistApi } from '../services/api';

export const Sidebar = ({ onOpenOmnibar }) => {
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-zenvy-cardElevated text-white font-semibold border-l-2 border-zenvy-violet'
        : 'text-zenvy-muted hover:text-white hover:bg-zenvy-card'
    }`;

  const handleCreateNewPlaylist = async () => {
    try {
      const newPl = await playlistApi.create(
        `Playlist Baru #${Math.floor(Math.random() * 900 + 100)}`,
        'Kurasi frekuensi suasana suara pribadi.'
      );
      navigate(`/playlist/${newPl.id}/edit`);
    } catch (e) {
      console.error(e);
      navigate('/playlists');
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-zenvy-sidebar border-r border-zenvy-border flex flex-col justify-between hidden md:flex h-screen sticky top-0 z-30 select-none">
      
      {/* Bagian Atas */}
      <div className="p-4 space-y-5 overflow-y-auto no-scrollbar">
        
        {/* Logo ZENVY */}
        <NavLink to="/" className="flex items-center gap-3 px-2 py-1 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zenvy-violet to-purple-800 flex items-center justify-center shadow-lg shadow-zenvy-violet/30 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">ZENVY</span>
            <p className="text-[10px] text-zenvy-violetSoft font-medium tracking-wide">Find Your Frequency.</p>
          </div>
        </NavLink>

        {/* Navigasi Utama */}
        <nav className="space-y-1">
          <NavLink to="/" className={navClass}>
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Beranda</span>
          </NavLink>

          <NavLink to="/explore" className={navClass}>
            <Compass className="w-4 h-4 text-zinc-400" />
            <span>Jelajahi Suasana</span>
          </NavLink>

          <NavLink to="/search" className={navClass}>
            <Search className="w-4 h-4 text-zinc-400" />
            <span>Cari</span>
          </NavLink>
        </nav>

        {/* Pembatas */}
        <div className="h-px bg-zenvy-border" />

        {/* Seksi Koleksi & Kurasi */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Koleksi Anda</span>
            <FolderHeart className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <NavLink to="/favorites" className={navClass}>
            <Heart className="w-4 h-4 text-red-400" />
            <span>Favorit</span>
          </NavLink>

          <NavLink to="/playlists" className={navClass}>
            <ListMusic className="w-4 h-4 text-zenvy-violetSoft" />
            <span>Playlist</span>
          </NavLink>

          {/* Tombol Buat Playlist */}
          <button
            onClick={handleCreateNewPlaylist}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zenvy-violetSoft hover:text-white hover:bg-zenvy-violet/10 border border-dashed border-zenvy-violet/30 hover:border-zenvy-violet transition mt-2"
          >
            <PlusCircle className="w-4 h-4 text-zenvy-violetSoft" />
            <span>Buat Playlist</span>
          </button>
        </div>

        {/* Pintasan Suasana Suara & Lingkungan */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Suasana Suara</span>
            <Sparkles className="w-3 h-3 text-zenvy-mint" />
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
            {SONIC_HABITATS.map((hab) => (
              <NavLink
                key={hab.id}
                to={`/explore?habitat=${encodeURIComponent(hab.name)}`}
                className="block px-3 py-1.5 text-xs text-zenvy-muted hover:text-white rounded hover:bg-zenvy-card transition truncate"
              >
                ● {hab.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Telemetri Audio Engine */}
      <div className="p-3 m-3 rounded-xl bg-zenvy-card border border-zenvy-border space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-zenvy-mint animate-ping" />
            Mesin Audio Aktif
          </span>
          <span className="text-[10px] font-mono text-zenvy-mint font-semibold px-1 rounded bg-zenvy-mint/10 border border-zenvy-mint/20">
            98.4 kHz
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">
          Pemutaran lossless YouTube IFrame API tanpa kompresi berlebih.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
