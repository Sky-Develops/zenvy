import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Users, 
  Lock, 
  Music, 
  Heart, 
  Search, 
  Check, 
  Play, 
  Trash2,
  FolderPlus,
  Loader2,
  ListMusic,
  ListPlus
} from 'lucide-react';
import { playlistApi, favoritesApi, musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
];

export const CreatePlaylist = () => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState(['Focus', 'Lo-Fi']);
  const [newTagInput, setNewTagInput] = useState('');

  const [selectedTracks, setSelectedTracks] = useState([]);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [addModeTab, setAddModeTab] = useState('favorites'); // 'favorites' | 'search' | 'recommendations'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favs, recs] = await Promise.all([
          favoritesApi.getAll().catch(() => []),
          musicApi.getCatalog().catch(() => [])
        ]);
        setFavoriteTracks(favs || []);
        setRecommendedTracks((recs || []).slice(0, 10));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSearchSong = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await musicApi.search(searchQuery.trim());
      setSearchResults(res || []);
    } finally {
      setIsSearching(false);
    }
  };

  const isTrackAdded = (track) => {
    const trackId = track.videoId || track.id;
    return selectedTracks.some(t => (t.videoId || t.id) === trackId);
  };

  const toggleTrack = (track) => {
    const trackId = track.videoId || track.id;
    if (isTrackAdded(track)) {
      setSelectedTracks(selectedTracks.filter(t => (t.videoId || t.id) !== trackId));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await playlistApi.create(name.trim(), description.trim(), isPublic, coverUrl);
      if (selectedTracks.length > 0 && created?.id) {
        for (const track of selectedTracks) {
          try {
            await playlistApi.addTrack(created.id, track);
          } catch (err) {
            console.error('Error adding track to new playlist:', err);
          }
        }
      }
      navigate('/playlists');
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Preparing playlist studio..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link
            to="/playlists"
            className="w-9 h-9 rounded-xl bg-[#1C1C1F] hover:bg-[#25252B] text-zinc-300 hover:text-white flex items-center justify-center transition shadow-sm"
            title="Back to Playlists"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-zenvy-primary" />
              <span>Create New Playlist</span>
            </h1>
            <p className="text-xs text-zenvy-muted">
              Configure playlist details and add initial tracks for your collection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/playlists"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </Link>

          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors duration-200 disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Playlist ({selectedTracks.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. BALANCED HERO STUDIO CARD: Cover Art & Metadata In One Unified Row */}
      <div className="relative group p-6 sm:p-7 rounded-3xl bg-[#1C1C1F]/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Corner Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 pointer-events-none transition-all duration-500" />
        
        {/* Hover Glowing Tapered Bottom Outline */}
        <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute w-3/4 h-2.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
          <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
          <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 sm:gap-8">
          
          {/* Cover Art Box & Preset Selector */}
          <div className="w-full md:w-52 flex-shrink-0 space-y-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black shadow-2xl group/cover">
              <img
                src={coverUrl}
                alt="Playlist Cover"
                className="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-semibold text-white/90">Preview Artwork</span>
              </div>
            </div>

            {/* Preset Thumbnails */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1.5">
                Quick Covers:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COVERS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`aspect-square rounded-lg overflow-hidden transition ${
                      coverUrl === url
                        ? 'ring-2 ring-zenvy-primary scale-105 shadow-md shadow-emerald-500/20'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata & Details Form */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Playlist Name *
              </label>
              <input
                type="text"
                required
                placeholder="Give your playlist a title (e.g. Midnight Code Focus)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#121214] text-white text-base sm:text-lg font-bold placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary shadow-inner"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Describe the mood, vibe, or listening context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#121214] text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary resize-none leading-relaxed shadow-inner"
              />
            </div>

            {/* Bottom Controls: Visibility + Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              
              {/* Visibility Switch */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hidden sm:inline">
                  Visibility:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-[#121214]">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isPublic
                        ? 'bg-zenvy-primary text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      !isPublic
                        ? 'bg-zenvy-primary text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              {/* Tags & Labels */}
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-[#25252B] text-zinc-300"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-red-400 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {/* Custom Tag Input */}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="+ tag"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-16 px-2 py-1 text-[11px] rounded-lg bg-[#121214] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary"
                  />
                  {newTagInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2 py-1 rounded-lg bg-zenvy-primary text-white text-[10px] font-bold"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BALANCED 2-COLUMN TRACK STUDIO (50% Discover / 50% Selected Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Discover & Add Tracks */}
        <div className="relative group p-6 rounded-2xl bg-[#1C1C1F]/85 backdrop-blur-xl shadow-xl overflow-hidden h-[540px] flex flex-col transition-all duration-300">
          {/* Corner Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

          {/* Hover glowing bottom outline */}
          <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute w-3/4 h-2.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
            <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
            <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col h-full space-y-4">
            
            {/* Header & Source Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 flex-shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <ListPlus className="w-4 h-4 text-zenvy-primary" />
                <span>Discover Tracks</span>
              </h3>

              <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddModeTab('favorites')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    addModeTab === 'favorites'
                      ? 'bg-zenvy-primary text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-current text-red-400" />
                  <span>Liked ({favoriteTracks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModeTab('search')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    addModeTab === 'search'
                      ? 'bg-zenvy-primary text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModeTab('recommendations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    addModeTab === 'recommendations'
                      ? 'bg-zenvy-primary text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3 h-3" />
                  <span>Recommended</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: SEARCH BAR (IF SEARCH TAB) */}
            {addModeTab === 'search' && (
              <form onSubmit={handleSearchSong} className="flex gap-2 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search YouTube for songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#121214] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 transition shadow"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>
            )}

            {/* SCROLLABLE TRACKS LIST */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
              
              {/* 1. FAVORITES TAB */}
              {addModeTab === 'favorites' && (
                favoriteTracks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500">
                    <Heart className="w-8 h-8 text-zinc-600" />
                    <p className="text-xs text-white font-medium">No liked songs in your library yet.</p>
                    <p className="text-[11px] text-zenvy-muted max-w-xs">
                      Like any track while playing to quickly add them here.
                    </p>
                  </div>
                ) : (
                  favoriteTracks.map((fav) => {
                    const favId = fav.videoId || fav.id;
                    const isAdded = isTrackAdded(fav);
                    return (
                      <div
                        key={favId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          isAdded ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={fav.thumbnailUrl || `https://i.ytimg.com/vi/${favId}/hqdefault.jpg`}
                            alt={fav.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-zenvy-text truncate">{fav.title}</h4>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{fav.channelTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => playTrack(fav)}
                            className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-300 hover:text-white flex items-center justify-center transition"
                            title="Preview Track"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleTrack(fav)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isAdded
                                ? 'bg-zenvy-primary text-white shadow'
                                : 'bg-[#25252B] hover:bg-zenvy-primary hover:text-white text-zinc-300'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {/* 2. SEARCH TAB */}
              {addModeTab === 'search' && (
                isSearching ? (
                  <div className="h-full flex items-center justify-center">
                    <LoadingSpinner message="Searching YouTube tracks..." size="sm" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((song) => {
                    const sId = song.videoId || song.id;
                    const isAdded = isTrackAdded(song);
                    return (
                      <div
                        key={sId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          isAdded ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={song.thumbnailUrl || `https://i.ytimg.com/vi/${sId}/hqdefault.jpg`}
                            alt={song.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-zenvy-text truncate">{song.title}</h4>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.channelTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => playTrack(song)}
                            className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-300 hover:text-white flex items-center justify-center transition"
                            title="Preview"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleTrack(song)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isAdded
                                ? 'bg-zenvy-primary text-white shadow'
                                : 'bg-[#25252B] hover:bg-zenvy-primary hover:text-white text-zinc-300'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500">
                    <Search className="w-8 h-8 text-zinc-600" />
                    <p className="text-xs text-white font-medium">Search any YouTube song or artist.</p>
                    <p className="text-[11px] text-zenvy-muted max-w-xs">
                      Type a keyword and press Search to find tracks.
                    </p>
                  </div>
                )
              )}

              {/* 3. RECOMMENDATIONS TAB */}
              {addModeTab === 'recommendations' && (
                recommendedTracks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Music className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-xs text-white font-medium">No recommended tracks available right now.</p>
                  </div>
                ) : (
                  recommendedTracks.map((rec) => {
                    const recId = rec.videoId || rec.id;
                    const isAdded = isTrackAdded(rec);
                    return (
                      <div
                        key={recId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          isAdded ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={rec.thumbnailUrl || `https://i.ytimg.com/vi/${recId}/hqdefault.jpg`}
                            alt={rec.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-zenvy-text truncate">{rec.title}</h4>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{rec.channelTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => playTrack(rec)}
                            className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-300 hover:text-white flex items-center justify-center transition"
                            title="Preview"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleTrack(rec)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isAdded
                                ? 'bg-zenvy-primary text-white shadow'
                                : 'bg-[#25252B] hover:bg-zenvy-primary hover:text-white text-zinc-300'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Playlist Tracks Queue (Selected Tracks) */}
        <div className="relative group p-6 rounded-2xl bg-[#1C1C1F]/85 backdrop-blur-xl shadow-xl overflow-hidden h-[540px] flex flex-col transition-all duration-300">
          {/* Corner Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

          {/* Hover glowing bottom outline */}
          <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute w-3/4 h-2.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
            <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
            <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col h-full space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-zenvy-primary" />
                  <span>Playlist Tracks ({selectedTracks.length})</span>
                </h3>
                <p className="text-[11px] text-zenvy-muted">
                  These songs will be added to your new playlist on save.
                </p>
              </div>

              {selectedTracks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTracks([])}
                  className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Track Queue Listing */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
              {selectedTracks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-[#121214] text-zinc-600 flex items-center justify-center shadow-inner">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-white font-medium">No tracks added to playlist yet</p>
                  <p className="text-[11px] text-zenvy-muted max-w-xs leading-relaxed">
                    Click <strong className="text-white">+ Add</strong> on any song from the left column to build your playlist queue.
                  </p>
                </div>
              ) : (
                selectedTracks.map((track, idx) => {
                  const trackId = track.videoId || track.id;
                  return (
                    <div
                      key={trackId || idx}
                      className="p-2 rounded-xl bg-[#121214] hover:bg-[#1E1E22] flex items-center justify-between gap-3 text-xs transition group/track"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[11px] font-mono text-zinc-500 w-4 text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white truncate group-hover/track:text-zenvy-primary transition">
                            {track.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {track.channelTitle || 'Artist'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => playTrack(track)}
                          className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-400 hover:text-white flex items-center justify-center transition"
                          title="Preview Track"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTrack(track)}
                          className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
                          title="Remove track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Summary Bar */}
            {selectedTracks.length > 0 && (
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 flex-shrink-0">
                <span>Total queued: <strong className="text-white font-mono">{selectedTracks.length} tracks</strong></span>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating || !name.trim()}
                  className="px-4 py-1.5 rounded-lg bg-zenvy-primary hover:bg-emerald-600 text-white font-bold transition disabled:opacity-50"
                >
                  Save Playlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
