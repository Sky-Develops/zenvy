import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search songs, artists, or genres...' }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleQuickTag = (tag) => {
    setQuery(tag);
    onSearch(tag);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zenvy-muted group-focus-within:text-zenvy-primary transition-colors">
          <div className="w-7 h-7 rounded-lg bg-[#27272B] flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-14 pr-28 py-3 rounded-xl bg-zenvy-card/90 backdrop-blur-md text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary/60 transition shadow-inner text-sm"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggested Genre / Mood Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zenvy-muted no-scrollbar">
        <span className="font-medium text-zinc-500 whitespace-nowrap">Suggested:</span>
        {['Lofi Beats', 'Synthwave', 'Deep Focus', 'Cyberpunk', 'Acoustic Indie', 'Chill Jazz'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="px-3 py-1 rounded-lg bg-[#1C1C1F] hover:bg-zenvy-elevated text-zinc-300 hover:text-white whitespace-nowrap transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
