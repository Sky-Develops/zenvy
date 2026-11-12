import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      handleSearch(query);
    }
  }, [isOpen]);

  const handleSearch = async (val) => {
    setLoading(true);
    try {
      const data = await musicApi.search(val);
      setResults(data || []);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    handleSearch(val);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
  };

  const handleSelectTrack = (track) => {
    playTrack(track);
    onClose();
    navigate(`/music/${track.videoId || track.id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 animate-fade-in">
      {/* Modal Card Surface with Frosted Glass Blur */}
      <div className="w-full max-w-2xl bg-[#1C1C1F]/85 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] relative">
        {/* Glow in top-right corner of card */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Search Input Bar with Submit to Dedicated Search Page */}
        <form onSubmit={handleSubmit} className="relative flex items-center px-4 py-3 bg-[#1C1C1F]/90 gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#27272B] flex items-center justify-center flex-shrink-0 text-zenvy-primary shadow-sm">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={onInputChange}
            placeholder="Search songs, artists, or genres..."
            className="w-full bg-transparent text-sm text-zenvy-text placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); handleSearch(''); }}
              className="p-1 rounded text-zinc-400 hover:text-white"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {query.trim() && (
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Search</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#121214] px-2 py-1 rounded text-zinc-400 flex-shrink-0">
            ESC
          </kbd>
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#121214]/60 text-xs flex-shrink-0">
          {['All', 'Tracks', 'Artists', 'Playlists'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === tab
                  ? 'bg-zenvy-elevated text-white font-semibold'
                  : 'text-zenvy-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {loading ? (
            <p className="text-center text-xs text-zenvy-muted py-8">Scanning music database...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#121214] text-zinc-500 flex items-center justify-center mx-auto shadow-inner">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {query ? `No instant recommendations for "${query}"` : 'Type any song or artist'}
                </p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Search across the full YouTube audio database on the dedicated Search page.
                </p>
              </div>
              {query.trim() && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search on Search Page</span>
                </button>
              )}
            </div>
          ) : (
            results.map((track) => {
              const trackId = track.videoId || track.id;
              return (
                <div
                  key={trackId}
                  onClick={() => handleSelectTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-zenvy-elevated cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-black shadow-sm"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zenvy-text group-hover:text-zenvy-primary truncate transition-colors">
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zenvy-muted mt-0.5">
                        <span className="truncate">{track.channelTitle}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-300 font-medium px-2.5 py-1 rounded-md bg-[#27272B] group-hover:text-zenvy-primary transition">
                    Play
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action: Go to Dedicated Search Page */}
        {query.trim() && results.length > 0 && (
          <div className="p-2.5 border-t border-white/5 bg-[#1C1C1F]/60 flex-shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2 px-3 rounded-xl bg-[#121214] hover:bg-[#25252B] text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>View full search results for "{query}" on Search page →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchModal;
