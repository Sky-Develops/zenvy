import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { musicApi, favoritesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MUSIC_CATEGORIES = ['All', 'Lo-Fi', 'Synthwave', 'Acoustic', 'Ambient', 'Electronic'];

export const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('genre') || searchParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [modalMusic, setModalMusic] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadExploreData();
  }, [activeCategory, user]);

  const loadExploreData = async () => {
    setLoading(true);
    try {
      const [musicList, favList] = await Promise.all([
        musicApi.search(activeCategory === 'All' ? '' : activeCategory),
        favoritesApi.getAll().catch(() => [])
      ]);
      setTracks(musicList);
      setFavoriteIds(new Set(favList.map(f => f.videoId || f.id)));
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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Header Explore */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Music
        </h1>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {MUSIC_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeCategory === cat
                ? 'bg-zenvy-primary text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1C1C1F] hover:bg-[#25252A] text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Tracks Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {activeCategory === 'All' ? 'Trending & Popular Tracks' : `Genre: ${activeCategory}`}
            </h2>
          </div>
          <span className="text-xs text-zenvy-muted font-mono">{tracks.length} tracks found</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Browsing music catalog..." size="lg" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {tracks.map((music) => {
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

export default Explore;
