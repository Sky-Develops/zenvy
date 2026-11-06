import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Semua');
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

  const handleSelectTrack = (track) => {
    playTrack(track);
    onClose();
    navigate(`/music/${track.videoId || track.id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-zenvy-sidebar rounded-xl border border-zenvy-border shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Bilah Input Pencarian */}
        <div className="relative border-b border-zenvy-border flex items-center px-4 py-3 bg-zenvy-card">
          <Search className="w-5 h-5 text-zenvy-violetSoft mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={onInputChange}
            placeholder="Ketik judul lagu, musisi, tangga nada (misal: F# Minor), atau suasana..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); handleSearch(''); }}
              className="p-1 rounded text-zinc-400 hover:text-white mr-2"
              title="Hapus teks"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-zenvy-obsidian px-2 py-1 rounded border border-zenvy-border text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Tab Filter Pencarian */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zenvy-border bg-zenvy-obsidian text-xs">
          {['Semua', 'Lagu', 'Suasana', 'Tangga Nada'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === tab
                  ? 'bg-zenvy-cardElevated text-white font-semibold border border-zenvy-border'
                  : 'text-zenvy-muted hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Daftar Hasil */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <p className="text-center text-xs text-zenvy-muted py-8">Memindai basis data frekuensi...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-xs text-zenvy-muted py-8">Tidak ada frekuensi yang cocok.</p>
          ) : (
            results.map((track) => {
              const trackId = track.videoId || track.id;
              return (
                <div
                  key={trackId}
                  onClick={() => handleSelectTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-zenvy-card cursor-pointer transition border border-transparent hover:border-zenvy-border"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0 bg-black"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-zenvy-violetSoft truncate">
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zenvy-muted mt-0.5">
                        <span className="truncate">{track.channelTitle}</span>
                        {track.musicalKey && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zenvy-cardElevated text-zinc-300 font-mono">
                            {track.musicalKey}
                          </span>
                        )}
                        {track.bpm && (
                          <span className="text-[10px] text-zinc-400 font-mono font-medium">
                            {track.bpm} BPM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-white">
                    <span className="hidden sm:inline text-[11px]">Putar Langsung</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pintasan Bawah */}
        <div className="p-2.5 bg-zenvy-card border-t border-zenvy-border text-[11px] text-zinc-500 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span><kbd className="bg-zenvy-obsidian px-1.5 py-0.5 rounded border border-zenvy-border">↑↓</kbd> Navigasi</span>
            <span><kbd className="bg-zenvy-obsidian px-1.5 py-0.5 rounded border border-zenvy-border">↵</kbd> Buka</span>
            <span><kbd className="bg-zenvy-obsidian px-1.5 py-0.5 rounded border border-zenvy-border">Spasi</kbd> Putar/Jeda</span>
          </div>
          <span className="text-zinc-400 font-mono">320kbps Lossless</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
