import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  X, 
  Sparkles, 
  Play, 
  Heart, 
  Plus, 
  Disc3, 
  Radio, 
  ArrowRight 
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { musicApi, favoritesApi, playlistApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const SEARCH_TABS = [
  'Semua Frekuensi',
  'Lagu & Trek',
  'Artis & Musisi',
  'Playlist',
  'Kanal YouTube'
];

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('Semua Frekuensi');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [modalMusic, setModalMusic] = useState(null);

  const { playTrack } = usePlayer();

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query);
    }, query ? 450 : 0);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const executeSearch = async (val) => {
    setLoading(true);
    try {
      const [data, favs] = await Promise.all([
        musicApi.search(val),
        favoritesApi.getAll().catch(() => [])
      ]);
      setResults(data || []);
      setFavoriteIds(new Set(favs.map(f => f.videoId || f.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    executeSearch('');
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

  const topMatch = results[0];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Search Input Bar Section */}
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cari Musik & Frekuensi
        </h1>
        <p className="text-xs sm:text-sm text-zenvy-muted">
          Pindai basis data YouTube, frekuensi suasana 432 Hz, dan nada musik dengan seketika.
        </p>

        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zenvy-violetSoft transition">
            <SearchIcon className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik judul lagu, musisi, tangga nada (misal: F# Minor), atau suasana..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-zenvy-card border border-zenvy-border text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zenvy-violet focus:ring-1 focus:ring-zenvy-violet shadow-inner transition"
          />

          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-zinc-400 hover:text-white"
                title="Hapus kueri"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-zenvy-violet/20 transition"
            >
              Pindai
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-zenvy-border">
        {SEARCH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-zenvy-violet text-white font-bold'
                : 'border-transparent text-zenvy-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hasil Pencarian */}
      {loading ? (
        <LoadingSpinner message="Memindai gelombang frekuensi..." size="lg" />
      ) : results.length === 0 ? (
        <EmptyState
          title="Tidak Ada Frekuensi yang Cocok"
          description={`Pencarian untuk "${query}" tidak menemukan hasil. Coba gunakan kata kunci musisi atau tangga nada lain.`}
          actionLabel="Bersihkan Pencarian"
          onAction={handleClear}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Top Result Card & Rekomendasi Unggulan */}
          {topMatch && query && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Hasil Teratas */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Hasil Teratas
                </h3>
                <div className="p-5 rounded-2xl bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border transition group flex flex-col justify-between h-56 shadow-lg">
                  <div className="flex items-start gap-4">
                    <img
                      src={topMatch.thumbnailUrl}
                      alt={topMatch.title}
                      className="w-20 h-20 rounded-xl object-cover border border-zenvy-border shadow"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zenvy-card text-zinc-300 border border-zenvy-border">
                        {topMatch.habitat || 'Frekuensi Terbaik'}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5 truncate group-hover:text-zenvy-violetSoft transition">
                        {topMatch.title}
                      </h4>
                      <p className="text-xs text-zenvy-muted mt-0.5">{topMatch.channelTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zenvy-border/60">
                    <span className="text-xs text-zinc-400 font-mono">
                      {topMatch.musicalKey} • {topMatch.bpm} BPM
                    </span>
                    <button
                      onClick={() => playTrack(topMatch)}
                      className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lagu Terpopuler Sesuai Kueri */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Lagu Terpopuler
                </h3>
                <div className="space-y-1.5">
                  {results.slice(0, 4).map((track, i) => {
                    const trackId = track.videoId || track.id;
                    return (
                      <div
                        key={trackId}
                        className="p-2.5 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span className="text-xs font-mono text-zinc-500 w-4">{i + 1}</span>
                          <img
                            src={track.thumbnailUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/music/${trackId}`}
                              className="text-xs font-semibold text-white group-hover:text-zenvy-violetSoft truncate block"
                            >
                              {track.title}
                            </Link>
                            <p className="text-[11px] text-zenvy-muted truncate">{track.channelTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono">
                            {track.views || '1.1M tayangan'}
                          </span>
                          <button
                            onClick={() => playTrack(track)}
                            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zenvy-violet/20"
                            title="Putar"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Grid Seluruh Hasil Frekuensi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zenvy-violetSoft" />
                <span>Seluruh Frekuensi Ditemukan</span>
              </h3>
              <span className="text-xs text-zinc-400">{results.length} hasil</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {results.map((music) => {
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
          </div>
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

export default Search;

