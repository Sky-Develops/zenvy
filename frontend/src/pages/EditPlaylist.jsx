import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Plus, 
  Music, 
  Users, 
  Lock, 
  Check, 
  Heart, 
  Search,
  ListMusic,
  ListPlus
} from 'lucide-react';
import { playlistApi, musicApi, favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
];

export const EditPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [tracks, setTracks] = useState([]);
  
  // Track addition modes
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addModeTab, setAddModeTab] = useState('favorites'); // 'favorites' | 'search' | 'recommendations'

  useEffect(() => {
    loadPlaylistData();
  }, [id]);

  const loadPlaylistData = async () => {
    setLoading(true);
    try {
      const [data, catalog, favs] = await Promise.all([
        playlistApi.getById(id),
        musicApi.search(''),
        favoritesApi.getAll().catch(() => [])
      ]);

      if (data) {
        setPlaylist(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setCoverUrl(data.coverUrl || PRESET_COVERS[0]);
        setIsPublic(data.isPublic ?? true);
        setTags(data.moodTags || ['Focus', 'Relax']);
        setTracks(data.tracks || []);
      }

      setFavoriteTracks(favs || []);

      const currentTrackIds = new Set((data?.tracks || []).map(t => t.videoId || t.id));
      setRecommendedTracks((catalog || []).filter(t => !currentTrackIds.has(t.videoId || t.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        coverUrl,
        isPublic,
        moodTags: tags,
        tracks
      };

      const updated = await playlistApi.update(id, payload);
      setPlaylist(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update playlist:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async () => {
    setDeleting(true);
    try {
      await playlistApi.delete(id);
      navigate('/playlists');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const moveTrack = (index, direction) => {
    const newTracks = [...tracks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newTracks.length) return;

    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIdx];
    newTracks[targetIdx] = temp;
    setTracks(newTracks);
  };

  const removeTrack = (trackId) => {
    setTracks(tracks.filter(t => (t.videoId || t.id) !== trackId));
  };

  const addTrackToPlaylist = (track) => {
    const trackId = track.videoId || track.id;
    if (tracks.some(t => (t.videoId || t.id) === trackId)) return;
    setTracks([...tracks, track]);
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

  const isTrackInPlaylist = (track) => {
    const trackId = track.videoId || track.id;
    return tracks.some(t => (t.videoId || t.id) === trackId);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading playlist editor..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Top Header Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlists')}
            className="w-9 h-9 rounded-xl bg-[#1C1C1F] hover:bg-[#25252B] text-zinc-300 hover:text-white flex items-center justify-center transition shadow-sm"
            title="Back to Playlists"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Edit Playlist:</span>
              <span className="text-zenvy-primary">{name}</span>
            </h1>
            <p className="text-xs text-zenvy-muted">
              Customize artwork, metadata, and reorder playback tracks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400" />
              Changes Saved
            </span>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Delete this playlist"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 1. BALANCED HERO STUDIO CARD: Cover Art & Metadata Form In One Unified Card */}
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
                alt={name}
                className="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition p-3 text-center backdrop-blur-[2px]">
                <Upload className="w-5 h-5 text-zenvy-primary" />
                <span className="text-[11px] text-white font-semibold">Choose preset below</span>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#121214] text-white text-base sm:text-lg font-bold placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary shadow-inner"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Playlist notes and description..."
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

      {/* 2. BALANCED 2-COLUMN STUDIO: Add Tracks (Left 50%) & Track Order (Right 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Add Tracks to Playlist */}
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
                <span>Add Tracks</span>
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
                    <p className="text-xs text-white font-medium">No liked songs in your library.</p>
                  </div>
                ) : (
                  favoriteTracks.map((fav) => {
                    const favId = fav.videoId || fav.id;
                    const inPlaylist = isTrackInPlaylist(fav);
                    return (
                      <div
                        key={favId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          inPlaylist ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
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
                            onClick={() => !inPlaylist && addTrackToPlaylist(fav)}
                            disabled={inPlaylist}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              inPlaylist
                                ? 'bg-[#25252B] text-zenvy-primary cursor-default'
                                : 'bg-zenvy-primary hover:bg-emerald-600 text-white shadow'
                            }`}
                          >
                            {inPlaylist ? (
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
                    const inPlaylist = isTrackInPlaylist(song);
                    return (
                      <div
                        key={sId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          inPlaylist ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
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
                            onClick={() => !inPlaylist && addTrackToPlaylist(song)}
                            disabled={inPlaylist}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              inPlaylist
                                ? 'bg-[#25252B] text-zenvy-primary cursor-default'
                                : 'bg-zenvy-primary hover:bg-emerald-600 text-white shadow'
                            }`}
                          >
                            {inPlaylist ? (
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
                  </div>
                )
              )}

              {/* 3. RECOMMENDATIONS TAB */}
              {addModeTab === 'recommendations' && (
                recommendedTracks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Music className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-xs text-white font-medium">All recommendations are already in this playlist.</p>
                  </div>
                ) : (
                  recommendedTracks.map((rec) => {
                    const recId = rec.videoId || rec.id;
                    const inPlaylist = isTrackInPlaylist(rec);
                    return (
                      <div
                        key={recId}
                        className={`p-2 rounded-xl transition flex items-center justify-between gap-3 ${
                          inPlaylist ? 'bg-[#25252B]' : 'bg-[#121214] hover:bg-[#1E1E22]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
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
                            onClick={() => !inPlaylist && addTrackToPlaylist(rec)}
                            disabled={inPlaylist}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              inPlaylist
                                ? 'bg-[#25252B] text-zenvy-primary cursor-default'
                                : 'bg-zenvy-primary hover:bg-emerald-600 text-white shadow'
                            }`}
                          >
                            {inPlaylist ? (
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

        {/* RIGHT COLUMN: Current Playlist Tracks & Playback Order */}
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
                  <span>Playback Sequence ({tracks.length})</span>
                </h3>
                <p className="text-[11px] text-zenvy-muted">
                  Use arrow buttons to adjust playback order.
                </p>
              </div>

              {tracks.length > 0 && (
                <button
                  type="button"
                  onClick={() => playTrack(tracks[0])}
                  className="px-3 py-1.5 rounded-xl bg-zenvy-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 transition shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Play First</span>
                </button>
              )}
            </div>

            {/* Reorderable Track List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
              {tracks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-[#121214] text-zinc-600 flex items-center justify-center shadow-inner">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-white font-medium">No tracks in this playlist</p>
                  <p className="text-[11px] text-zenvy-muted max-w-xs leading-relaxed">
                    Add tracks from Liked Songs or search on the left to build your playlist.
                  </p>
                </div>
              ) : (
                tracks.map((track, idx) => {
                  const trackId = track.videoId || track.id;
                  return (
                    <div
                      key={trackId || idx}
                      className="p-2 rounded-xl bg-[#121214] hover:bg-[#1E1E22] flex items-center justify-between gap-3 text-xs transition group/track"
                    >
                      {/* Sequence & Info */}
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

                      {/* Controls: Up, Down, Delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveTrack(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-400 hover:text-white disabled:opacity-20 flex items-center justify-center transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTrack(idx, 'down')}
                          disabled={idx === tracks.length - 1}
                          title="Move Down"
                          className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-400 hover:text-white disabled:opacity-20 flex items-center justify-center transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTrack(trackId)}
                          title="Remove from playlist"
                          className="w-7 h-7 rounded-lg bg-[#1C1C1F] text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition ml-0.5"
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
            {tracks.length > 0 && (
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 flex-shrink-0">
                <span>Total: <strong className="text-white font-mono">{tracks.length} tracks</strong></span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-zenvy-primary hover:bg-emerald-600 text-white font-bold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Sequence'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Confirm Delete Playlist */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
          <div className="relative group w-full max-w-sm bg-[#1C1C1F]/90 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl overflow-hidden space-y-4">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Playlist?</h3>
                  <p className="text-xs text-zenvy-muted">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">"{name}"</strong>? All tracks in this playlist will be removed.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePlaylist}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Playlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPlaylist;
