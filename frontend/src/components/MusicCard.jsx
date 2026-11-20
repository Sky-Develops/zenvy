import React from 'react';
import { Play, Heart, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

export const MusicCard = ({
  music,
  isFavorite = false,
  onToggleFavorite,
  onAddToPlaylist,
  showRemoveFavorite = false,
  onRemoveFavorite
}) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  if (!music) return null;

  const trackId = music.videoId || music.id;
  const isCurrentActive = (currentTrack?.videoId || currentTrack?.id) === trackId;

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack(music);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (showRemoveFavorite && onRemoveFavorite) {
      onRemoveFavorite(trackId);
    } else if (onToggleFavorite) {
      onToggleFavorite(music);
    }
  };

  const handlePlaylistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(music);
    }
  };

  return (
    <div className="relative group flex flex-col">
      {/* Main Card Surface: Frosted glass blur with corner glow and hover tapered bottom outline */}
      <div className="relative flex-1 bg-[#1C1C1F]/85 backdrop-blur-xl hover:bg-[#232328] rounded-2xl p-3.5 transition-colors duration-200 flex flex-col justify-between shadow-xl overflow-hidden">
        
        {/* Glow inside card in the top-right corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

        {/* Thumbnail Container with Ambient Overlay & Blur */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black mb-3.5 shadow-inner">
          <img
            src={music.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
            alt={music.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Ambient Gradient Overlay with subtle blur */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent backdrop-blur-[1px] opacity-70 group-hover:opacity-40 transition-opacity" />

          {/* Play Button Overlay (Clean solid mint, no bright wireframe outline) */}
          <button
            onClick={handlePlayClick}
            aria-label={`Play ${music.title}`}
            className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
              isCurrentActive && isPlaying
                ? 'bg-zenvy-primary text-white shadow-emerald-950/30'
                : 'bg-zenvy-primary text-white opacity-90 sm:opacity-0 group-hover:opacity-100 hover:bg-emerald-600 shadow-lg'
            }`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
          </button>

          {/* Active playback badge */}
          {isCurrentActive && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-zenvy-primary text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <div className="flex items-end gap-[1.5px] h-2.5">
                <span className="w-[1.5px] h-2 bg-white animate-pulse" />
                <span className="w-[1.5px] h-2.5 bg-white animate-pulse [animation-delay:0.2s]" />
                <span className="w-[1.5px] h-1.5 bg-white animate-pulse [animation-delay:0.4s]" />
              </div>
              PLAYING
            </div>
          )}
        </div>

        {/* Info & Typography */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link
              to={`/music/${trackId}`}
              className="block text-sm font-semibold text-zenvy-text group-hover:text-zenvy-primary line-clamp-2 leading-snug transition-colors mb-1"
              title={music.title}
            >
              {music.title}
            </Link>
            <p className="text-xs text-zenvy-muted line-clamp-1 mb-3">
              {music.channelTitle || 'YouTube Music'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFavoriteClick}
                title={isFavorite || showRemoveFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition shadow-sm ${
                  isFavorite || showRemoveFavorite
                    ? 'text-red-500 bg-red-500/15'
                    : 'bg-[#25252B] text-zinc-300 hover:text-red-400 hover:bg-[#303036]'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${isFavorite || showRemoveFavorite ? 'fill-current' : ''}`}
                />
              </button>

              {onAddToPlaylist && (
                <button
                  onClick={handlePlaylistClick}
                  title="Add to Playlist"
                  className="w-7 h-7 rounded-lg bg-[#25252B] text-zinc-300 hover:text-white hover:bg-[#303036] flex items-center justify-center transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePlayClick}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors duration-200 shadow-sm ${
                  isCurrentActive && isPlaying
                    ? 'bg-zenvy-primary text-white shadow-emerald-950/30'
                    : 'bg-zenvy-primary hover:bg-emerald-600 text-white'
                }`}
                title="Play Track"
              >
                <Play className="w-3 h-3 fill-current text-white" />
                <span>{isCurrentActive && isPlaying ? 'Playing' : 'Play'}</span>
              </button>

              <Link
                to={`/music/${trackId}`}
                title="View Details"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white px-2 py-1 rounded-lg bg-[#25252B] hover:bg-[#303036] transition shadow-sm"
              >
                <span>Detail</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hover glowing bottom outline: thick & luminous in the center, tapering to left and right */}
        <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute w-3/4 h-2.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
          <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
          <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
