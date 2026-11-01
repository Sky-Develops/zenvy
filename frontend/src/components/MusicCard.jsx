import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Plus, ExternalLink, Activity, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const MusicCard = ({
  music,
  isFavorite = false,
  onToggleFavorite,
  onAddToPlaylist,
  showRemoveFavorite = false,
  onRemoveFavorite,
}) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
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
    <div className="group relative bg-zenvy-card hover:bg-zenvy-cardElevated rounded-lg p-3 border border-zenvy-border hover:border-zenvy-border/80 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-md overflow-hidden bg-zenvy-obsidian mb-3">
        <img
          src={music.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
          alt={music.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Play Button Overlay */}
        <button
          onClick={handlePlayClick}
          aria-label={`Play ${music.title}`}
          className={`absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            isCurrentActive && isPlaying
              ? 'bg-zenvy-violet text-white scale-100 shadow-lg shadow-zenvy-violet/50 ring-2 ring-white/50'
              : 'bg-zenvy-violet text-white opacity-0 group-hover:opacity-100 group-hover:scale-105 hover:bg-purple-600 shadow-md'
          }`}
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>

        {/* Momentum & Telemetry badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {music.momentum && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 backdrop-blur-md text-zenvy-mint border border-zenvy-mint/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {music.momentum}
            </span>
          )}
        </div>

        {/* Active playback indicator */}
        {isCurrentActive && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-zenvy-violet text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Active
          </div>
        )}
      </div>

      {/* Info & Sonic DNA */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/music/${trackId}`}
            className="block text-sm font-semibold text-white group-hover:text-zenvy-violetSoft line-clamp-2 leading-snug transition-colors mb-1"
            title={music.title}
          >
            {music.title}
          </Link>
          <p className="text-xs text-zenvy-muted line-clamp-1 mb-2">
            {music.channelTitle || 'YouTube Music'}
          </p>

          {/* Sonic DNA pill line */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-3 flex-wrap">
            {music.musicalKey && (
              <span className="px-1.5 py-0.5 rounded bg-zenvy-obsidian border border-zenvy-border font-mono text-zinc-300">
                {music.musicalKey}
              </span>
            )}
            {music.bpm && (
              <span className="px-1.5 py-0.5 rounded bg-zenvy-obsidian border border-zenvy-border font-mono text-zenvy-mint">
                {music.bpm} BPM
              </span>
            )}
            {music.lufs && (
              <span className="px-1.5 py-0.5 rounded bg-zenvy-obsidian border border-zenvy-border font-mono text-zinc-400">
                {music.lufs}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zenvy-border/60">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFavoriteClick}
              title={isFavorite || showRemoveFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-md transition ${
                isFavorite || showRemoveFavorite
                  ? 'text-red-500 hover:text-red-400 bg-red-500/10'
                  : 'text-zinc-400 hover:text-red-400 hover:bg-zenvy-cardElevated'
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
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zenvy-cardElevated transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link
            to={`/music/${trackId}`}
            title="Inspect Sonic DNA & Detail"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zenvy-muted hover:text-white px-2 py-1 rounded hover:bg-zenvy-cardElevated transition"
          >
            <span>Sonic DNA</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
