import React, { useState, useEffect } from 'react';
import { Headphones, Play, Sparkles, Flame, Plus, Heart, ListMusic } from 'lucide-react';
import { Link } from 'react-router-dom';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { musicApi, favoritesApi } from '../services/api';

import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [modalMusic, setModalMusic] = useState(null);

  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { user } = useAuth();

  // Dynamic time-based greeting in English
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 12) return 'Good morning';
    if (hr >= 12 && hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tracks, favs] = await Promise.all([
        musicApi.search(''),
        favoritesApi.getAll().catch(() => [])
      ]);
      setMusicList(tracks || []);
      setFavoriteIds(new Set((favs || []).map(f => f.videoId || f.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (track) => {
    const trackId = track.videoId || track.id;
    const isFav = favoriteIds.has(trackId);
    try {
      if (isFav) {
        await favoritesApi.remove(trackId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
      } else {
        await favoritesApi.add(track);
        setFavoriteIds(prev => new Set(prev).add(trackId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const featuredTrack = musicList[0];
  const topSongs = musicList.slice(0, 6);
  const recommendedTracks = musicList.length > 6 ? musicList.slice(6) : musicList;

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Dynamic Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {user?.username || 'Listener'}
          </h1>
        </div>
      </div>

      {/* 1. Featured Track Hero Banner (Identity: Corner Glow + Tapered Bottom Outline) */}
      {featuredTrack && (
        <section className="relative group">
          {/* Frosted Glass Banner Surface */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/40 via-[#1C1C1F]/90 to-[#121214]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* Glow in top-right corner inside the banner */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Info */}
              <div className="md:col-span-8 space-y-4">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  {featuredTrack.title}
                </h2>

                <p className="text-xs sm:text-sm text-zenvy-muted max-w-2xl line-clamp-2 leading-relaxed">
                  {featuredTrack.description || 'High-fidelity audio stream optimized for deep focus and productivity.'}
                </p>

                {/* Buttons: Smooth color transition without scale jump */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => playTrack(featuredTrack)}
                    className="px-6 py-2.5 rounded-xl bg-zenvy-primary text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 hover:bg-emerald-600 transition-colors duration-200 shadow-lg shadow-emerald-950/30"
                  >
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>Play Now</span>
                  </button>

                  <Link
                    to={`/music/${featuredTrack.videoId || featuredTrack.id}`}
                    className="px-4 py-2.5 rounded-xl bg-[#25252B] hover:bg-[#303036] text-xs font-semibold text-zinc-300 hover:text-white transition-colors duration-200 shadow-sm"
                  >
                    Track Details
                  </Link>
                </div>
              </div>

              {/* Right Artwork with ambient drop shadow */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl bg-black">
                  <img
                    src={featuredTrack.thumbnailUrl}
                    alt={featuredTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Hover glowing bottom outline: thick & luminous in the center, tapering to left and right */}
            <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute w-3/4 h-3 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
              <div className="absolute w-1/2 h-1.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
              <div className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
            </div>
          </div>
        </section>
      )}

      {/* 2. Top Songs Section (Direct Songs, Not Just Playlists) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Trending Songs
              </h3>
            </div>
          </div>
          <span className="text-xs text-zenvy-muted font-mono">{topSongs.length} top picks</span>
        </div>

        {/* 2-Column Responsive Songs Grid with Blurry + Glow Underneath */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topSongs.map((track, idx) => {
            const trackId = track.videoId || track.id;
            const isTrackActive = (currentTrack?.videoId || currentTrack?.id) === trackId;
            const isFav = favoriteIds.has(trackId);

            return (
              <div key={trackId} className="relative group">
                {/* Frosted Glass Song Card with Corner Glow & Hover Tapered Bottom Outline */}
                <div className={`relative rounded-xl p-2.5 bg-[#1C1C1F]/80 hover:bg-[#25252B] backdrop-blur-xl transition-colors duration-200 flex items-center justify-between gap-3 overflow-hidden ${
                  isTrackActive ? 'bg-[#27272B]' : ''
                }`}>
                  {/* Glow in top-right corner inside the card */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  {/* Left: Thumbnail & Song Info */}
                  <div 
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer relative z-10"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 shadow-md">
                      <img
                        src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <Play className={`w-4 h-4 ${isTrackActive && isPlaying ? 'text-emerald-400 fill-current' : 'text-white fill-current'}`} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-semibold truncate transition-colors ${
                        isTrackActive ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-zenvy-muted truncate mt-0.5">
                        {track.channelTitle || 'Artist'}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
                    <button
                      onClick={() => handleToggleFavorite(track)}
                      title={isFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav ? 'text-red-400 bg-red-500/10' : 'text-zinc-400 hover:text-red-400 hover:bg-white/5'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => setModalMusic(track)}
                      title="Add to Playlist"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hover glowing bottom outline: thick & luminous in the center, tapering to left and right */}
                  <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute w-3/4 h-2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
                    <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
                    <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Recommended Audio Streams Grid (Cards with Identity: Blurry + Glow Underneath) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-sm">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Recommended For You
              </h3>
            </div>
          </div>
          <span className="text-xs text-zenvy-muted font-mono">{recommendedTracks.length} tracks</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading music catalog..." size="lg" />
        ) : recommendedTracks.length === 0 ? (
          <EmptyState
            title="Music Catalog Loading"
            description="Unable to load music catalog right now. Please check your internet connection."
            actionLabel="Reload"
            onAction={fetchInitialData}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {recommendedTracks.map((music) => {
              const trackId = music.videoId || music.id;
              return (
                <MusicCard
                  key={trackId}
                  music={music}
                  isFavorite={favoriteIds.has(trackId)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(t) => setModalMusic(t)}
                />
              );
            })}
          </div>
        )}
      </section>

      <AddToPlaylistModal
        isOpen={!!modalMusic}
        music={modalMusic}
        onClose={() => setModalMusic(null)}
      />
    </div>
  );
};

export default Home;
