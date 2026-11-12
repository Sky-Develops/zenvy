import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Search, 
  Heart, 
  ListMusic, 
  PlusCircle,
  FolderHeart,
  Clock,
  Play
} from 'lucide-react';

import { playlistApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import ZenvyLogo from './ZenvyLogo';

export const Sidebar = ({ onOpenOmnibar }) => {
  const navigate = useNavigate();
  const { recentlyPlayed = [], playTrack, currentTrack, isPlaying } = usePlayer();

  const navClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-zenvy-elevated text-emerald-400 font-semibold shadow-sm'
        : 'text-zinc-400 hover:text-white hover:bg-zenvy-elevated/70'
    }`;

  const handleCreateNewPlaylist = () => {
    navigate('/playlist/create');
  };

  return (
    <aside 
      className="w-64 flex-shrink-0 bg-[#121214] border-r border-white/5 flex flex-col hidden md:flex h-full z-30 select-none overflow-hidden overscroll-none touch-none"
      onWheel={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Non-scrollable Fixed Tab Area */}
      <div className="p-3.5 space-y-3 flex flex-col h-full overflow-hidden">
        
        {/* ZENVY Brand Logo */}
        <div className="px-2 py-1 select-none">
          <Link to="/" className="inline-flex items-center">
            <ZenvyLogo />
          </Link>
        </div>

        {/* Main Navigation (Clean, without unnecessary containers) */}
        <nav className="space-y-1">
          <NavLink to="/" className={navClass}>
            {({ isActive }) => (
              <>
                <Home className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>Home</span>
              </>
            )}
          </NavLink>

          <NavLink to="/explore" className={navClass}>
            {({ isActive }) => (
              <>
                <Compass className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>Explore</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className={navClass}>
            {({ isActive }) => (
              <>
                <Search className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>Search</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Subtle Divider */}
        <div className="h-px bg-white/5" />

        {/* Your Library Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            <span>Your Library</span>
            <FolderHeart className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <NavLink to="/favorites" className={navClass}>
            {({ isActive }) => (
              <>
                <Heart className={`w-4 h-4 ${isActive ? 'text-red-400 fill-current' : 'text-zinc-400 group-hover:text-red-400'}`} />
                <span>Liked Songs</span>
              </>
            )}
          </NavLink>

          <NavLink to="/playlists" className={navClass}>
            {({ isActive }) => (
              <>
                <ListMusic className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>Playlists</span>
              </>
            )}
          </NavLink>

          {/* Create Playlist Button (Clean, without box container) */}
          <button
            onClick={handleCreateNewPlaylist}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zenvy-elevated transition mt-1"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-white/5" />

        {/* Recently Played Section (Under Your Library - Up to 10 tracks) */}
        <div className="space-y-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recently Played</span>
            </span>
            {recentlyPlayed.length > 0 && (
              <span className="text-[10px] text-zinc-500 font-mono">{recentlyPlayed.length}</span>
            )}
          </div>

          {recentlyPlayed.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zenvy-muted italic">
              No recent tracks
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto no-scrollbar overscroll-contain flex-1 pr-0.5">
              {recentlyPlayed.slice(0, 10).map((track) => {
                const trackId = track.videoId || track.id;
                const isTrackActive = (currentTrack?.videoId || currentTrack?.id) === trackId;
                return (
                  <div
                    key={trackId}
                    onClick={() => playTrack(track)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                      isTrackActive
                        ? 'bg-[#27272B] text-emerald-400'
                        : 'text-zinc-300 hover:text-white hover:bg-[#1E1E22]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className="relative w-8 h-8 rounded-md overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isTrackActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-end justify-center pb-1 gap-[2px]">
                            <span className="w-[2.5px] h-3 bg-emerald-400 rounded-full animate-bounce" />
                            <span className="w-[2.5px] h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-[2.5px] h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isTrackActive ? 'text-emerald-400 font-semibold' : 'text-zinc-200 group-hover:text-white'}`}>
                          {track.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {track.channelTitle || 'Artist'}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition shadow-sm flex-shrink-0 ${
                        isTrackActive && isPlaying
                          ? 'bg-zenvy-primary text-white'
                          : 'bg-[#27272B] hover:bg-zenvy-primary text-zinc-300 hover:text-white opacity-90 group-hover:opacity-100'
                      }`}
                      title={isTrackActive && isPlaying ? "Currently Playing" : "Play Track"}
                    >
                      {isTrackActive && isPlaying ? (
                        <div className="flex items-end gap-[1.5px] h-2.5">
                          <span className="w-[1.5px] h-2 bg-white animate-pulse" />
                          <span className="w-[1.5px] h-3 bg-white animate-pulse [animation-delay:0.2s]" />
                          <span className="w-[1.5px] h-1.5 bg-white animate-pulse [animation-delay:0.4s]" />
                        </div>
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
