import React, { useState, useEffect } from 'react';
import { Heart, Search, Play, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
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

  useEffect(() => {
    loadFavorites();
  }, []);

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
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-500/10 via-zenvy-card to-zenvy-obsidian border border-zenvy-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Frekuensi Favorit Anda</h1>
            <p className="text-xs sm:text-sm text-zenvy-muted mt-1">
              {favorites.length} gelombang frekuensi yang Anda simpan untuk akses instan.
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-zenvy-violet/25 hover:scale-105 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Putar Semua Favorit</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter lokal dalam Favorit */}
      {favorites.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zenvy-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari dalam daftar favorit tersimpan..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-zenvy-card border border-zenvy-border text-white placeholder-zinc-500 focus:outline-none focus:border-zenvy-violet"
          />
        </div>
      )}

      {/* Konten */}
      {loading ? (
        <LoadingSpinner message="Memuat daftar frekuensi favorit..." size="lg" />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Belum Ada Lagu Favorit"
          description="Anda belum menyimpan frekuensi musik apa pun. Klik ikon hati pada kartu lagu saat menjelajah untuk menyimpannya di sini."
          actionLabel="Jelajahi Suasana"
          onAction={() => window.location.href = '/explore'}
        />
      ) : filteredFavorites.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak Ada yang Cocok"
          description={`Tidak ada lagu favorit yang cocok dengan kata kunci "${filterQuery}".`}
          actionLabel="Bersihkan Filter"
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
