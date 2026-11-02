import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Search, 
  Heart, 
  ListMusic, 
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
        'Koleksi playlist musik pribadi.'
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
        
        {/* Logo ZENVY Brand */}
        <div className="px-2 py-1 select-none">
          <span className="text-xl font-bold tracking-tight text-white block">ZENVY</span>
          <p className="text-xs text-zinc-400 font-normal">Find Your Frequency.</p>
        </div>

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
            <ListMusic className="w-4 h-4 text-zinc-400" />
            <span>Playlist</span>
          </NavLink>

          {/* Tombol Buat Playlist (Solid border bersih, tanpa garis putus-putus) */}
          <button
            onClick={handleCreateNewPlaylist}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border transition mt-2"
          >
            <PlusCircle className="w-4 h-4 text-zinc-400" />
            <span>Buat Playlist</span>
          </button>
        </div>

        {/* Pintasan Kategori Suasana */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Kategori Suasana</span>
            <Sparkles className="w-3 h-3 text-zinc-500" />
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

      {/* Bagian Bawah: Informasi Pemutar YouTube Resmi (Bersih, tanpa kedipan & tanpa neon) */}
      <div className="p-3 m-3 rounded-xl bg-zenvy-card border border-zenvy-border space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Pemutar YouTube
          </span>
          <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zenvy-obsidian border border-zenvy-border">
            Resmi
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">
          Pemutaran audio melalui YouTube IFrame Player API resmi.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
