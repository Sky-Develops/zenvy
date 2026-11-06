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
  Sparkles, 
  Globe, 
  Lock, 
  Check, 
  AlertCircle,
  Heart,
  Search
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
  const [frequencyPreset, setFrequencyPreset] = useState('432 Hz Resonansi');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [tracks, setTracks] = useState([]);
  
  // States penambahan lagu
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
        setFrequencyPreset(data.frequencyPreset || '432 Hz Resonansi');
        setTags(data.moodTags || ['Fokus', 'Larut Malam', 'BPM 70-110']);
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
    e.preventDefault();
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Reorder tracks
  const moveTrack = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tracks.length) return;

    const updated = [...tracks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setTracks(updated);
  };

  const removeTrack = (trackId) => {
    setTracks(tracks.filter(t => (t.videoId || t.id) !== trackId));
  };

  const handleDeletePlaylist = async () => {
    setDeleting(true);
    try {
      await playlistApi.delete(id);
      navigate('/playlists');
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  const isTrackInPlaylist = (track) => {
    const tid = track.videoId || track.id;
    return tracks.some(t => (t.videoId || t.id) === tid);
  };

  const addTrackToPlaylist = (track) => {
    const tid = track.videoId || track.id;
    if (tracks.some(t => (t.videoId || t.id) === tid)) return;
    setTracks(prev => [...prev, track]);
    setRecommendedTracks(prev => prev.filter(t => (t.videoId || t.id) !== tid));
  };

  const handleSearchSong = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await musicApi.search(searchQuery.trim());
      setSearchResults(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await playlistApi.update(id, {
        name,
        description,
        coverUrl,
        isPublic,
        frequencyPreset,
        moodTags: tags,
        tracks
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Memuat editor playlist..." size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Playlist Tidak Ditemukan</h2>
        <Link to="/playlists" className="px-4 py-2 rounded-lg bg-zenvy-violet text-white text-xs font-semibold">
          Kembali ke Koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Top Bar Navigation & Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zenvy-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlists')}
            className="p-2 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border text-zinc-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Edit Playlist: {name}
            </h1>
            <p className="text-xs text-zenvy-muted">
              Sesuaikan metadata, kanvas sampul Hi-Fi, dan susun alur urutan frekuensi lagu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold bg-zenvy-card px-3 py-1.5 rounded-lg border border-zenvy-border">
              <Check className="w-4 h-4 text-emerald-400" />
              Perubahan Disimpan
            </span>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Hapus Playlist Ini"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Playlist</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-zenvy-violet/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Metadata & Canvas Sampul (Left) + Manajemen Lagu (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Metadata & Sampul Hi-Fi */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Sampul Hi-Fi Canvas */}
          <div className="p-5 rounded-2xl bg-zenvy-card border border-zenvy-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Kanvas Sampul Resolusi Tinggi (3000 x 3000)
            </h3>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-zenvy-border bg-black shadow-2xl group">
              <img
                src={coverUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition p-4 text-center">
                <Upload className="w-6 h-6 text-zenvy-violetSoft" />
                <span className="text-xs text-white font-semibold">Pilih Dari Preset Sampul di Bawah</span>
              </div>
            </div>

            {/* Preset Covers Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-zenvy-muted">Pilih Sampul Kurasi Cepat:</span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COVERS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      coverUrl === url ? 'border-zenvy-violet scale-105 shadow-md shadow-zenvy-violet/40' : 'border-zenvy-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card Form Metadata */}
          <form onSubmit={handleSave} className="p-5 rounded-2xl bg-zenvy-card border border-zenvy-border space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nama Playlist *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white text-sm focus:outline-none focus:border-zenvy-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Deskripsi & Catatan Kurasi
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan tujuan dan konteks frekuensi playlist ini..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white text-xs focus:outline-none focus:border-zenvy-violet resize-none leading-relaxed"
              />
            </div>

            {/* Penyelarasan Frekuensi Utama */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Penyelarasan Frekuensi Utama</span>
                <span className="text-[10px] text-zinc-400 font-mono">Tuning Audio</span>
              </label>
              <select
                value={frequencyPreset}
                onChange={(e) => setFrequencyPreset(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white text-xs focus:outline-none focus:border-zenvy-violet"
              >
                <option value="432 Hz Resonansi">432 Hz Resonansi Alami (Fokus Kognitif)</option>
                <option value="528 Hz Solfeggio">528 Hz Nada Pemulihan (Meditasi)</option>
                <option value="Standar 440 Hz">Standar 440 Hz Studio</option>
                <option value="Binaural Theta 6Hz">Binaural Theta 6 Hz Gelombang Otak</option>
              </select>
            </div>

            {/* Pengaturan Visibilitas (Publik / Privat) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Visibilitas Playlist
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    isPublic
                      ? 'bg-purple-900 border-purple-500 text-white'
                      : 'bg-zenvy-obsidian border-zenvy-border text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publik di Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    !isPublic
                      ? 'bg-purple-900 border-purple-500 text-white'
                      : 'bg-zenvy-obsidian border-zenvy-border text-zinc-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Koleksi Privat</span>
                </button>
              </div>
            </div>

            {/* Tag Suasana & Mood */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tag & Filter Suasana Suara
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-zenvy-cardElevated border border-zenvy-border text-zinc-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah tag (misal: Synthwave)..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white focus:outline-none focus:border-zenvy-violet"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-zenvy-cardElevated hover:bg-zenvy-border text-xs font-semibold text-white transition"
                >
                  Tambah
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Manajemen Lagu (Urutan & DNA) + Tambah Lagu Bebas / Dari Favorit */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Daftar Lagu dalam Playlist */}
          <div className="p-5 rounded-2xl bg-zenvy-card border border-zenvy-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zenvy-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Urutan Trek Lagu ({tracks.length})
                </h3>
                <p className="text-[11px] text-zenvy-muted">
                  Gunakan tombol panah untuk menaikkan/menurunkan urutan frekuensi lagu.
                </p>
              </div>

              {tracks.length > 0 && (
                <button
                  onClick={() => playTrack(tracks[0])}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-black" />
                  <span>Uji Putar</span>
                </button>
              )}
            </div>

            {tracks.length === 0 ? (
              <p className="text-center text-xs text-zenvy-muted py-8">
                Belum ada trek di playlist ini. Tambahkan dari lagu favorit Anda atau cari lagu di bawah.
              </p>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto no-scrollbar pr-1">
                {tracks.map((track, idx) => {
                  const trackId = track.videoId || track.id;
                  return (
                    <div
                      key={trackId || idx}
                      className="p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between gap-3 transition group"
                    >
                      {/* Urutan & Thumbnail */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xs font-mono text-zinc-500 w-4 text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                          alt={track.title}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-zenvy-violetSoft transition">
                            {track.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                            <span className="truncate">{track.channelTitle}</span>
                            <span>•</span>
                            <span className="font-mono text-zinc-300">{track.musicalKey || 'F# Minor'}</span>
                            <span>•</span>
                            <span className="font-mono text-zinc-400">{track.bpm || 80} BPM</span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Reorder & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveTrack(idx, 'up')}
                          disabled={idx === 0}
                          title="Naikkan urutan"
                          className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zenvy-card"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTrack(idx, 'down')}
                          disabled={idx === tracks.length - 1}
                          title="Turunkan urutan"
                          className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zenvy-card"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTrack(trackId)}
                          title="Hapus dari playlist"
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Penambahan Lagu ke Playlist (Bukan Hanya Rekomendasi!) */}
          <div className="p-5 rounded-2xl bg-zenvy-card border border-zenvy-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zenvy-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-zenvy-violetSoft" />
                  <span>Tambahkan Lagu ke Playlist Sendiri</span>
                </h3>
                <p className="text-[11px] text-zenvy-muted">
                  Bebas menambahkan lagu dari Favorit Anda, pencarian YouTube, maupun rekomendasi.
                </p>
              </div>

              {/* Tabs Sumber Tambah Lagu */}
              <div className="flex items-center gap-1 bg-zenvy-obsidian p-1 rounded-lg border border-zenvy-border flex-wrap">
                <button
                  type="button"
                  onClick={() => setAddModeTab('favorites')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    addModeTab === 'favorites'
                      ? 'bg-zenvy-violet text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-current text-red-400" />
                  <span>Lagu Favorit ({favoriteTracks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModeTab('search')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    addModeTab === 'search'
                      ? 'bg-zenvy-violet text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>Cari Lagu Bebas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModeTab('recommendations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    addModeTab === 'recommendations'
                      ? 'bg-zenvy-violet text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Rekomendasi</span>
                </button>
              </div>
            </div>

            {/* TAB 1: LAGU DARI DAFTAR FAVORIT SAYA */}
            {addModeTab === 'favorites' && (
              <div className="space-y-2">
                {favoriteTracks.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Heart className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-white font-medium">Belum ada lagu di daftar Favorit Anda.</p>
                    <p className="text-[11px] text-zenvy-muted max-w-sm mx-auto">
                      Beri tanda suka (ikon hati) pada lagu apa saja di menu Home, Search, atau Explore untuk menampilkannya di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                    {favoriteTracks.map((fav) => {
                      const favId = fav.videoId || fav.id;
                      const inPlaylist = isTrackInPlaylist(fav);
                      return (
                        <div
                          key={favId}
                          className="p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                            <img
                              src={fav.thumbnailUrl || `https://i.ytimg.com/vi/${favId}/hqdefault.jpg`}
                              alt={fav.title}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">{fav.title}</h4>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {fav.channelTitle} • {fav.musicalKey || 'F# Minor'} • {fav.bpm || 80} BPM
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => playTrack(fav)}
                              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zenvy-card"
                              title="Uji Putar"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              type="button"
                              onClick={() => !inPlaylist && addTrackToPlaylist(fav)}
                              disabled={inPlaylist}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                inPlaylist
                                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default'
                                  : 'bg-zenvy-violet hover:bg-purple-700 text-white shadow'
                              }`}
                            >
                              {inPlaylist ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Di Playlist</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah ke Playlist</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CARI LAGU BEBAS (YOUTUBE & KATALOG) */}
            {addModeTab === 'search' && (
              <div className="space-y-3">
                <form onSubmit={handleSearchSong} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari lagu YouTube apa saja (misal: Lofi Girl, Alan Walker, Synthwave)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white placeholder-zinc-500 focus:outline-none focus:border-zenvy-violet"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50 transition"
                  >
                    {isSearching ? 'Mencari...' : 'Cari Lagu'}
                  </button>
                </form>

                {isSearching ? (
                  <LoadingSpinner message="Mencari lagu di YouTube Data API..." size="sm" />
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                    {searchResults.map((song) => {
                      const sId = song.videoId || song.id;
                      const inPlaylist = isTrackInPlaylist(song);
                      return (
                        <div
                          key={sId}
                          className="p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                            <img
                              src={song.thumbnailUrl || `https://i.ytimg.com/vi/${sId}/hqdefault.jpg`}
                              alt={song.title}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">{song.title}</h4>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {song.channelTitle} • {song.musicalKey || 'F# Minor'} • {song.bpm || 80} BPM
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => playTrack(song)}
                              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zenvy-card"
                              title="Uji Putar"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              type="button"
                              onClick={() => !inPlaylist && addTrackToPlaylist(song)}
                              disabled={inPlaylist}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                inPlaylist
                                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default'
                                  : 'bg-zenvy-violet hover:bg-purple-700 text-white shadow'
                              }`}
                            >
                              {inPlaylist ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Di Playlist</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah ke Playlist</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-xs text-zenvy-muted py-6">
                    Ketik judul lagu atau musisi di atas untuk mencari dan menambahkannya ke playlist ini.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: REKOMENDASI CERDAS */}
            {addModeTab === 'recommendations' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                {recommendedTracks.length === 0 ? (
                  <p className="text-center text-xs text-zenvy-muted py-6">
                    Semua lagu rekomendasi sudah ada di dalam playlist ini.
                  </p>
                ) : (
                  recommendedTracks.map((rec) => {
                    const recId = rec.videoId || rec.id;
                    const inPlaylist = isTrackInPlaylist(rec);
                    return (
                      <div
                        key={recId}
                        className="p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
                          <img
                            src={rec.thumbnailUrl || `https://i.ytimg.com/vi/${recId}/hqdefault.jpg`}
                            alt={rec.title}
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">{rec.title}</h4>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {rec.channelTitle} • {rec.musicalKey || 'A Minor'} • {rec.bpm || 80} BPM
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => playTrack(rec)}
                            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zenvy-card"
                            title="Uji Putar"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            type="button"
                            onClick={() => !inPlaylist && addTrackToPlaylist(rec)}
                            disabled={inPlaylist}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                              inPlaylist
                                ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default'
                                : 'bg-zenvy-violet hover:bg-purple-700 text-white shadow'
                            }`}
                          >
                            {inPlaylist ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Di Playlist</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Cepat</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Playlist */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zenvy-sidebar rounded-2xl p-6 border border-zenvy-border shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Playlist?</h3>
                <p className="text-xs text-zenvy-muted">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus playlist <strong className="text-white">"{name}"</strong>? Semua lagu yang tersusun di dalamnya akan dihapus dari koleksi playlist ini.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePlaylist}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Playlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPlaylist;
