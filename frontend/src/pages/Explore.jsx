import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Radio, ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { musicApi, favoritesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SONIC_HABITATS } from '../services/mockData';

const FREQUENCY_CATEGORIES = [
  'Semua',
  'Elektronik & Dark Wave',
  'Ambient & Lo-Fi',
  'Synthwave',
  'Indie Chill & Akustik',
  'Fokus Mendalam & Belajar'
];

export const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialHabitat = searchParams.get('habitat') || 'Semua';

  const [activeCategory, setActiveCategory] = useState(initialHabitat);
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
        musicApi.search(activeCategory === 'Semua' ? '' : activeCategory),
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
    <div className="space-y-10 max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Header Jelajahi */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenvy-card border border-zenvy-border text-xs text-zinc-300 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Radar Penemuan Global Aktif</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Jelajahi Suasana Suara & Lingkungan
        </h1>
        <p className="text-sm text-zenvy-muted max-w-2xl">
          Selami gelombang frekuensi kurasi, penyelarasan harmonik 432 Hz, dan karya eksperimental berkualitas tinggi.
        </p>
      </div>

      {/* Filter Kategori & Genre Cepat */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {FREQUENCY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              activeCategory === cat
                ? 'bg-zenvy-violet text-white border-zenvy-violet shadow-md shadow-zenvy-violet/30'
                : 'bg-zenvy-card hover:bg-zenvy-cardElevated text-zinc-300 border-zenvy-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Suasana Suara & Lingkungan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-zenvy-violetSoft" />
            <span>Suasana Suara & Lingkungan Populer</span>
          </h2>
          <span className="text-xs text-zenvy-muted">4 Suasana Tersedia</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SONIC_HABITATS.map((hab) => (
            <div
              key={hab.id}
              onClick={() => setActiveCategory(hab.name)}
              className="group relative rounded-xl p-5 bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between h-40"
            >
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {hab.activeListeners}
                </span>
                <h3 className="text-base font-bold text-white mt-1 group-hover:text-zenvy-violetSoft transition">
                  {hab.name}
                </h3>
                <p className="text-xs text-zenvy-muted mt-0.5">{hab.tagline}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zenvy-border/50 text-xs text-zinc-400">
                <span>{hab.tracksCount} trek nada</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sedang Tren & Terpopuler */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>{activeCategory === 'Semua' ? 'Sedang Tren & Terpopuler' : `Suasana: ${activeCategory}`}</span>
            </h2>
            <p className="text-xs text-zenvy-muted">Aliran audio berkualitas tinggi dengan metrik momentum mingguan</p>
          </div>
          <span className="text-xs text-zinc-400">{tracks.length} trek</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Menyintesis katalog trek..." size="lg" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {tracks.map((track) => {
              const trackId = track.videoId || track.id;
              return (
                <MusicCard
                  key={trackId}
                  music={track}
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
