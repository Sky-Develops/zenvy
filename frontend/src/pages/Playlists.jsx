import React, { useState, useEffect } from 'react';
import { 
  ListMusic, 
  Plus, 
  Play, 
  Trash2, 
  Music, 
  FolderPlus, 
  ArrowRight,
  Edit3,
  Globe,
  Lock,
  Sparkles,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { playlistApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await playlistApi.getAll();
      setPlaylists(data || []);
      if (data && data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    setDeleting(true);
    try {
      await playlistApi.delete(playlistToDelete.id);
      const updated = playlists.filter(p => p.id !== playlistToDelete.id);
      setPlaylists(updated);
      if (selectedPlaylist?.id === playlistToDelete.id) {
        setSelectedPlaylist(updated.length > 0 ? updated[0] : null);
      }
      setPlaylistToDelete(null);
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      const created = await playlistApi.create(newName.trim(), newDesc.trim());
      setPlaylists(prev => [created, ...prev]);
      setSelectedPlaylist(created);
      setNewName('');
      setNewDesc('');
      setIsCreateOpen(false);
      navigate(`/playlist/${created.id}/edit`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    if (!selectedPlaylist) return;
    try {
      await playlistApi.removeTrack(selectedPlaylist.id, trackId);
      const updatedTracks = (selectedPlaylist.tracks || []).filter(
        t => (t.videoId || t.id) !== trackId
      );
      const updatedPlaylist = { ...selectedPlaylist, tracks: updatedTracks };
      setSelectedPlaylist(updatedPlaylist);
      setPlaylists(prev =>
        prev.map(p => (p.id === selectedPlaylist.id ? updatedPlaylist : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayAll = () => {
    if (selectedPlaylist?.tracks && selectedPlaylist.tracks.length > 0) {
      playTrack(selectedPlaylist.tracks[0]);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-900/30 via-zenvy-card to-zenvy-obsidian border border-zenvy-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-center text-zinc-300 shadow-lg">
            <ListMusic className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Playlist Kurasi Anda</h1>
            <p className="text-xs sm:text-sm text-zenvy-muted mt-1">
              Kelola dan susun frekuensi nada untuk berbagai kondisi fokus, belajar, dan relaksasi.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-zenvy-violet/25 hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Playlist Baru</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat koleksi playlist..." size="lg" />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="Belum Ada Playlist"
          description="Buat playlist pertama Anda untuk mengorganisir frekuensi nada dan lagu-lagu favorit."
          actionLabel="Buat Playlist"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Pemilih Playlist */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-zenvy-muted uppercase tracking-wider px-1">
              Semua Koleksi ({playlists.length})
            </h3>
            <div className="space-y-2">
              {playlists.map((pl) => {
                const isSelected = selectedPlaylist?.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylist(pl)}
                    className={`group w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-zenvy-cardElevated border-zenvy-violet text-white shadow-md'
                        : 'bg-zenvy-card hover:bg-zenvy-cardElevated border-zenvy-border text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={pl.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'}
                        alt={pl.name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm truncate">{pl.name}</h4>
                        <p className="text-[11px] text-zenvy-muted truncate mt-0.5">
                          {pl.tracks?.length || 0} trek • {pl.frequencyPreset || '432 Hz'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(pl);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                        title="Hapus playlist ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-zenvy-violetSoft' : 'text-zinc-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Detail Playlist Terpilih */}
          <div className="lg:col-span-8 bg-zenvy-card rounded-2xl p-6 sm:p-8 border border-zenvy-border space-y-6">
            {selectedPlaylist ? (
              <>
                {/* Header Playlist */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zenvy-border">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedPlaylist.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80'}
                      alt={selectedPlaylist.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-zenvy-border shadow-xl flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase px-2 py-0.5 rounded bg-zenvy-card border border-zenvy-border">
                          {selectedPlaylist.frequencyPreset || '432 Hz Resonansi'}
                        </span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          {selectedPlaylist.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {selectedPlaylist.isPublic ? 'Publik' : 'Privat'}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {selectedPlaylist.name}
                      </h2>
                      <p className="text-xs text-zenvy-muted mt-1 leading-relaxed max-w-xl">
                        {selectedPlaylist.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Tindakan */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="px-3.5 py-2 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Lagu</span>
                    </Link>

                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="px-3.5 py-2 rounded-lg bg-zenvy-cardElevated hover:bg-zenvy-border border border-zenvy-border text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Info & Sampul</span>
                    </Link>

                    <button
                      onClick={() => setPlaylistToDelete(selectedPlaylist)}
                      className="px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Hapus Playlist Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Playlist</span>
                    </button>

                    {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
                      <button
                        onClick={handlePlayAll}
                        className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-black" />
                        <span>Putar Semua</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Daftar Trek Lagu */}
                {selectedPlaylist.tracks?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPlaylist.tracks.map((track, idx) => {
                      const trackId = track.videoId || track.id;
                      return (
                        <div
                          key={trackId || idx}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border transition"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <span className="text-xs text-zinc-500 w-4 text-center font-mono">
                              {idx + 1}
                            </span>
                            <img
                              src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                              alt={track.title}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/music/${trackId}`}
                                className="block text-xs sm:text-sm font-semibold text-white hover:text-zenvy-violetSoft truncate"
                              >
                                {track.title}
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-zenvy-muted mt-0.5">
                                <span className="truncate">{track.channelTitle}</span>
                                <span>•</span>
                                <span className="font-mono text-zinc-400">{track.musicalKey || 'F# Minor'}</span>
                                <span>•</span>
                                <span className="font-mono text-zinc-400">{track.bpm || 80} BPM</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => playTrack(track)}
                              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zenvy-violet/20"
                              title="Putar"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => handleRemoveTrack(trackId)}
                              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                              title="Hapus trek"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <Music className="w-10 h-10 text-zinc-600 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">Playlist ini masih kosong</h4>
                    <p className="text-xs text-zenvy-muted max-w-sm mx-auto">
                      Tambahkan lagu dari daftar favorit Anda, cari lagu YouTube baru, atau gunakan rekomendasi cerdas.
                    </p>
                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold mt-2 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Lagu Sekarang</span>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-zenvy-muted text-center py-12">Pilih salah satu playlist</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Buat Playlist Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zenvy-sidebar rounded-2xl p-6 border border-zenvy-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zenvy-border">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-zenvy-violetSoft" />
                <span>Buat Playlist Baru</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Playlist *
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Alur Coding Malam"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white text-xs focus:outline-none focus:border-zenvy-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Deskripsi Suasana (opsional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Untuk apa kurasi frekuensi ini didengarkan?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zenvy-obsidian border border-zenvy-border text-white text-xs focus:outline-none focus:border-zenvy-violet resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newName.trim()}
                  className="px-4 py-2 rounded-lg bg-zenvy-violet hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Membuat...' : 'Buat & Buka Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Playlist */}
      {playlistToDelete && (
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
              Apakah Anda yakin ingin menghapus playlist <strong className="text-white">"{playlistToDelete.name}"</strong>? Semua susunan lagu di dalamnya akan dihapus.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlaylistToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeletePlaylist}
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

export default Playlists;
