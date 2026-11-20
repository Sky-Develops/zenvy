import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Play } from 'lucide-react';

import { favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [modalMusic, setModalMusic] = useState(null);

  const { playTrack } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoritesApi.getAll();
      setFavorites(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (trackId) => {
    try {
      await favoritesApi.remove(trackId);
      setFavorites(prev => prev.filter(item => (item.videoId || item.id) !== trackId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playTrack(favorites[0]);
    }
  };

  const filteredFavorites = favorites.filter(track => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      track.title?.toLowerCase().includes(q) ||
      track.channelTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      
      {/* Immersive Header Banner with Ambient Glow in Top-Right Corner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/30 via-[#1C1C1F] to-[#121214] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-red-500/15 filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-current flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Liked Songs</h1>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition-colors duration-200"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Play All Liked Songs</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search within Liked Songs */}
      {favorites.length > 0 && (
        <div className="relative max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search within liked songs..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#1C1C1F] text-zenvy-text placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary shadow-inner"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading your liked songs..." size="lg" />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Liked Songs Yet"
          description="You haven't liked any songs yet. Click the heart icon on any track to save it to your library."
          actionLabel="Explore Music"
          onAction={() => navigate('/explore')}
        />
      ) : filteredFavorites.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matches Found"
          description={`No liked songs match your search for "${filterQuery}".`}
          actionLabel="Clear Filter"
          onAction={() => setFilterQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredFavorites.map((track) => {
            const trackId = track.videoId || track.id;
            return (
              <MusicCard
                key={trackId}
                music={track}
                isFavorite={true}
                showRemoveFavorite={true}
                onRemoveFavorite={handleRemoveFavorite}
                onAddToPlaylist={(t) => setModalMusic(t)}
              />
            );
          })}
        </div>
      )}

      <AddToPlaylistModal
        isOpen={!!modalMusic}
        music={modalMusic}
        onClose={() => setModalMusic(null)}
      />
    </div>
  );
};

export default Favorites;
