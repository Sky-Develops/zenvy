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
  Sliders, 
  Check, 
  AlertCircle,
  Radio
} from 'lucide-react';
import { playlistApi, musicApi } from '../services/api';
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

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [frequencyPreset, setFrequencyPreset] = useState('432 Hz Resonansi');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [tracks, setTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  useEffect(() => {
    loadPlaylistData();
  }, [id]);

  const loadPlaylistData = async () => {
    setLoading(true);
    try {
      const data = await playlistApi.getById(id);
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

      // Load recommended tracks for quick addition
      const catalog = await musicApi.search('');
      const currentTrackIds = new Set((data?.tracks || []).map(t => t.videoId || t.id));
      setRecommendedTracks(catalog.filter(t => !currentTrackIds.has(t.videoId || t.id)));
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

  const addRecommendedTrack = (track) => {
    setTracks([...tracks, track]);
    setRecommendedTracks(recommendedTracks.filter(t => (t.videoId || t.id) !== (track.videoId || track.id)));
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

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-zenvy-mint font-semibold bg-zenvy-mint/10 px-3 py-1.5 rounded-lg border border-zenvy-mint/20">
              <Check className="w-4 h-4" />
              Perubahan Disimpan
            </span>
          )}

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
                <span className="text-[10px] text-zenvy-mint font-mono">Tuning Audio</span>
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
                      ? 'bg-zenvy-violet/20 border-zenvy-violet text-white'
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
                      ? 'bg-zenvy-violet/20 border-zenvy-violet text-white'
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

        {/* Kolom Kanan: Manajemen Lagu (Urutan & DNA) + Rekomendasi Cerdas */}
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
                Belum ada trek di playlist ini. Tambahkan dari rekomendasi cerdas di bawah.
              </p>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
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
                          src={track.thumbnailUrl}
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
                            <span className="font-mono text-zenvy-mint">{track.bpm || 80} BPM</span>
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

          {/* Rekomendasi Lagu Tambahan Cerdas */}
          <div className="p-5 rounded-2xl bg-zenvy-card border border-zenvy-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zenvy-mint" />
                <span>Rekomendasi Lagu Tambahan Cerdas</span>
              </h3>
              <span className="text-[10px] text-zenvy-mint font-mono">Penyelarasan Harmonik 90%+</span>
            </div>

            <div className="space-y-2">
              {recommendedTracks.slice(0, 3).map((rec) => {
                const recId = rec.videoId || rec.id;
                return (
                  <div
                    key={recId}
                    className="p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{rec.title}</h4>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {rec.channelTitle} • {rec.musicalKey || 'A Minor'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addRecommendedTrack(rec)}
                      className="px-2.5 py-1.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Cepat</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylist;

