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
      const created = await playlistApi.create(newPlaylistName.trim(), 'Created from track discovery');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      {/* Modal Surface Charcoal Slate with Glassmorphism */}
      <div className="w-full max-w-md bg-[#1C1C1F]/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow in top-right corner */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#27272B] flex items-center justify-center text-zenvy-primary shadow-sm">
              <ListMusic className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#27272B] hover:bg-[#323238] flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div className="text-xs text-zenvy-muted line-clamp-1 bg-[#121214]/60 px-3 py-2 rounded-lg">
            Target Track: <strong className="text-white font-medium ml-1">{music.title}</strong>
          </div>

          {/* Quick Create Form */}
          {isCreating ? (
            <form onSubmit={handleCreateNew} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="New playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-zenvy-obsidian text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zenvy-primary"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold transition shadow-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-2 text-xs text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 rounded-lg bg-zenvy-elevated hover:bg-[#323238] text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-zenvy-primary" />
              <span>Create New Playlist</span>
            </button>
          )}

          {/* Playlist List */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-center text-xs text-zenvy-muted py-4">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-center text-xs text-zenvy-muted py-4">No playlists yet. Create one now!</p>
            ) : (
              playlists.map((pl) => {
                const isAdded = addedIds.has(pl.id);
                return (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#161619] hover:bg-zenvy-elevated transition"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-zenvy-text">{pl.name}</h4>
                      <p className="text-[11px] text-zenvy-muted">
                        {pl.tracks?.length || 0} tracks
                      </p>
                    </div>

                    <button
                      onClick={() => !isAdded && handleAdd(pl.id)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        isAdded
                          ? 'bg-zenvy-elevated text-zenvy-primary cursor-default'
                          : 'bg-zenvy-primary hover:bg-emerald-400 text-white shadow-sm'
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
