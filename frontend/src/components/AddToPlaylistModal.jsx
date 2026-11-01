import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { playlistApi } from '../services/api';

export const AddToPlaylistModal = ({ isOpen, onClose, music }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const list = await playlistApi.getAll();
      setPlaylists(list);
      const existing = new Set();
      const trackId = music?.videoId || music?.id;
      list.forEach((pl) => {
        if (pl.tracks?.some((t) => (t.videoId || t.id) === trackId)) {
          existing.add(pl.id);
        }
      });
      setAddedIds(existing);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (playlistId) => {
    try {
      await playlistApi.addTrack(playlistId, music);
      setAddedIds((prev) => new Set(prev).add(playlistId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const created = await playlistApi.create(newPlaylistName.trim(), 'Dibuat dari penemuan lagu');
      await playlistApi.addTrack(created.id, music);
      setPlaylists((prev) => [created, ...prev]);
      setAddedIds((prev) => new Set(prev).add(created.id));
      setNewPlaylistName('');
      setIsCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !music) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zenvy-sidebar rounded-2xl border border-zenvy-border shadow-2xl overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-zenvy-border">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-zenvy-violetSoft" />
            <h3 className="text-sm font-bold text-white">Tambahkan ke Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div className="text-xs text-zenvy-muted line-clamp-1">
            Trek Tujuan: <strong className="text-white">{music.title}</strong>
          </div>

          {/* Form Buat Cepat */}
          {isCreating ? (
            <form onSubmit={handleCreateNew} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Nama playlist baru..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-zenvy-obsidian border border-zenvy-violet text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-zenvy-violet text-white text-xs font-semibold hover:bg-purple-700"
              >
                Buat
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Batal
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 rounded-lg border border-dashed border-zenvy-violet/40 hover:border-zenvy-violet bg-zenvy-violet/5 hover:bg-zenvy-violet/10 text-xs font-semibold text-zenvy-violetSoft flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Playlist Baru</span>
            </button>
          )}

          {/* Daftar Koleksi Playlist */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-center text-xs text-zenvy-muted py-4">Memuat playlist...</p>
            ) : playlists.length === 0 ? (
              <p className="text-center text-xs text-zenvy-muted py-4">Belum ada playlist. Buat satu sekarang!</p>
            ) : (
              playlists.map((pl) => {
                const isAdded = addedIds.has(pl.id);
                return (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zenvy-card border border-zenvy-border transition"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{pl.name}</h4>
                      <p className="text-[11px] text-zenvy-muted">
                        {pl.tracks?.length || 0} trek nada
                      </p>
                    </div>

                    <button
                      onClick={() => !isAdded && handleAdd(pl.id)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                        isAdded
                          ? 'bg-zenvy-mint/20 text-zenvy-mint border border-zenvy-mint/30 cursor-default'
                          : 'bg-zenvy-violet text-white hover:bg-purple-700'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ditambahkan</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambahkan</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zenvy-card border-t border-zenvy-border text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zenvy-cardElevated hover:bg-zenvy-border"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
