import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search songs, artists, or frequencies...' }) => {
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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zenvy-muted group-focus-within:text-zenvy-violetLight transition-colors">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-zenvy-card/80 border border-zenvy-border text-white placeholder-zenvy-muted/70 focus:outline-none focus:border-zenvy-violet focus:ring-2 focus:ring-zenvy-violet/30 transition-all duration-200 shadow-inner"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zenvy-border/50 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-zenvy-violet hover:bg-zenvy-violetDark text-white text-xs font-semibold tracking-wide shadow-md shadow-zenvy-violet/25 transition-all duration-150 hover:scale-105"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick frequency tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zenvy-muted no-scrollbar">
        <span className="font-medium text-zinc-500 whitespace-nowrap">Suggested:</span>
        {['Lofi Beats', 'Synthwave', 'Deep Focus', 'Cyberpunk', 'Acoustic Indie', 'Chill Jazz'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="px-3 py-1 rounded-full bg-zenvy-card hover:bg-zenvy-cardHover border border-zenvy-border hover:border-zenvy-violet/40 text-zinc-300 hover:text-zenvy-violetLight whitespace-nowrap transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;

