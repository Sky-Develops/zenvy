import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  X, 
  ListMusic, 
  Play, 
  Heart, 
  Plus, 
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { musicApi, favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const SEARCH_TABS = ['All', 'Tracks', 'Artists', 'Playlists'];

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [modalMusic, setModalMusic] = useState(null);

  const { playTrack } = usePlayer();
  const { user } = useAuth();

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    if (qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query);
    }, query ? 450 : 0);
    return () => clearTimeout(timer);
  }, [query, activeTab, user]);

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
          Search Music
        </h1>

        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zenvy-primary transition">
            <SearchIcon className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, or genres..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#1C1C1F]/80 backdrop-blur-xl text-zenvy-text text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary shadow-inner transition"
          />

          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="w-7 h-7 rounded-lg bg-[#25252B] text-zinc-400 hover:text-white flex items-center justify-center"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold transition shadow"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
        {SEARCH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-zenvy-primary text-white font-bold'
                : 'border-transparent text-zenvy-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Searching music catalog..." size="lg" />
      ) : results.length === 0 ? (
        <EmptyState
          title="No Tracks Found"
          description={`Your search for "${query}" did not match any tracks. Try searching for another artist or title.`}
          actionLabel="Clear Search"
          onAction={handleClear}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Top Result Card & Recommendations */}
          {topMatch && query && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Top Result Card - Card Besar */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-6 sm:p-7 rounded-3xl bg-[#1C1C1F]/85 backdrop-blur-xl hover:bg-[#232328] transition-all duration-300 group shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px] border border-white/5">
                  {/* Glow in top-right corner of card */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="relative">
                      <img
                        src={topMatch.thumbnailUrl}
                        alt={topMatch.title}
                        className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 group-hover:scale-[1.02] transition-transform duration-300 bg-black"
                      />
                    </div>

                    <div className="min-w-0 pt-1">
                      <Link
                        to={`/music/${topMatch.videoId || topMatch.id}`}
                        className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug line-clamp-2 group-hover:text-zenvy-primary transition block"
                      >
                        {topMatch.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          Track
                        </span>
                        <span className="text-xs text-zinc-400 font-medium truncate">
                          {topMatch.channelTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-2 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(topMatch)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-sm ${
                          favoriteIds.has(topMatch.videoId || topMatch.id)
                            ? 'text-red-500 bg-red-500/15'
                            : 'bg-[#25252B] text-zinc-300 hover:text-red-400 hover:bg-[#303036]'
                        }`}
                        title={favoriteIds.has(topMatch.videoId || topMatch.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
                      >
                        <Heart className={`w-4 h-4 ${favoriteIds.has(topMatch.videoId || topMatch.id) ? 'fill-current text-red-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => setModalMusic(topMatch)}
                        className="w-9 h-9 rounded-xl bg-[#25252B] text-zinc-300 hover:text-white hover:bg-[#303036] flex items-center justify-center transition shadow-sm"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => playTrack(topMatch)}
                      className="h-11 px-6 rounded-full bg-zenvy-primary text-white flex items-center gap-2 hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-950/30 hover:scale-105 active:scale-95 font-bold text-xs"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5 text-white" />
                      <span>Play</span>
                    </button>
                  </div>

                  {/* Hover glowing bottom outline */}
                  <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute w-3/4 h-2.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
                    <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
                    <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
                  </div>
                </div>
              </div>

              {/* Popular Tracks */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Popular Tracks
                </h3>
                <div className="space-y-1.5">
                  {results.slice(0, 4).map((track, i) => {
                    const trackId = track.videoId || track.id;
                    const isTrackFav = favoriteIds.has(trackId);
                    return (
                      <div
                        key={trackId}
                        className="p-2.5 rounded-xl bg-[#1C1C1F]/80 backdrop-blur-xl hover:bg-[#25252B] flex items-center justify-between transition-colors group relative overflow-hidden"
                      >
                        {/* Glow in top-right corner */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                        <div className="flex items-center gap-3 min-w-0 pr-2 relative z-10">
                          <span className="text-xs font-mono text-zinc-500 w-4 text-center">{i + 1}</span>
                          <img
                            src={track.thumbnailUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/music/${trackId}`}
                              className="text-xs font-semibold text-zenvy-text group-hover:text-zenvy-primary truncate block"
                            >
                              {track.title}
                            </Link>
                            <p className="text-[11px] text-zenvy-muted truncate">{track.channelTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 relative z-10">
                          <button
                            onClick={() => handleToggleFavorite(track)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                              isTrackFav ? 'text-red-500 bg-red-500/15' : 'bg-[#25252B] text-zinc-400 hover:text-red-400'
                            }`}
                            title={isTrackFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isTrackFav ? 'fill-current text-red-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => setModalMusic(track)}
                            className="w-7 h-7 rounded-lg bg-[#25252B] text-zinc-400 hover:text-white flex items-center justify-center transition"
                            title="Add to Playlist"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => playTrack(track)}
                            className="w-8 h-8 rounded-lg bg-[#25252B] text-zinc-300 hover:text-emerald-400 hover:bg-[#303036] flex items-center justify-center transition"
                            title="Play"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        {/* Hover glowing bottom outline */}
                        <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute w-3/4 h-2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
                          <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
                          <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* All Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-zenvy-primary" />
                <span>All Results</span>
              </h3>
              <span className="text-xs text-zenvy-muted font-mono">{results.length} tracks</span>
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
