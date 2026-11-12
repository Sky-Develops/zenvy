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
  Users,
  Lock,
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
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p));
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  const handlePlayAll = () => {
    if (selectedPlaylist?.tracks && selectedPlaylist.tracks.length > 0) {
      playTrack(selectedPlaylist.tracks[0]);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      
      {/* Immersive Header Banner with Ambient Glow in Top-Right Corner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/40 via-[#1C1C1F] to-[#121214] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/15 filter blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ListMusic className="w-7 h-7 text-zenvy-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Playlists</h1>
          </div>

          <button
            onClick={() => navigate('/playlist/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your playlists..." size="lg" />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No Playlists Yet"
          description="Create your first playlist to organize and collect your favorite music tracks."
          actionLabel="Create Playlist"
          onAction={() => navigate('/playlist/create')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Playlist Selector Cards */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-zenvy-muted uppercase tracking-wider">
                Your Collections ({playlists.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {playlists.map((pl) => {
                const isSelected = selectedPlaylist?.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylist(pl)}
                    className={`group relative w-full text-left p-3 rounded-2xl transition-colors duration-200 flex items-center justify-between cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-[#25252B] shadow-xl'
                        : 'bg-[#1C1C1F] hover:bg-[#222226]'
                    }`}
                  >
                    {/* Corner glow */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div className="flex items-center gap-3.5 min-w-0 pr-2 relative z-10">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black shadow-md">
                        <img
                          src={pl.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                          {pl.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zenvy-muted">
                            {pl.tracks?.length || 0} tracks
                          </span>
                          <span className="text-[10px] text-zinc-500">•</span>
                          <span className="text-[10px] text-zinc-400">
                            {pl.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(pl);
                        }}
                        className="w-7 h-7 rounded-lg bg-[#27272B] text-zinc-400 hover:text-red-400 hover:bg-red-500/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'text-emerald-400 bg-emerald-500/15' : 'text-zinc-500'}`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Hover glowing bottom outline: thick & luminous in the center, tapering to left and right */}
                    <div className="absolute -bottom-[1px] inset-x-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute w-3/4 h-2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
                      <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent blur-[1px]" />
                      <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 via-50% to-transparent" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Immersive Playlist Detailed View */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-[#1C1C1F] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Glow in top-right corner inside the card */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/15 filter blur-3xl pointer-events-none" />

            {selectedPlaylist ? (
              <div className="relative z-10 space-y-6">
                {/* Playlist Showcase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
                  <div className="flex items-start gap-5">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group bg-black">
                      <img
                        src={selectedPlaylist.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80'}
                        alt={selectedPlaylist.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
                        <button
                          onClick={handlePlayAll}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-zenvy-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-colors duration-200 shadow-2xl hover:bg-emerald-600"
                          title="Play All Tracks"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                          PLAYLIST
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] text-zinc-300 bg-[#25252B] flex items-center gap-1.5">
                          {selectedPlaylist.isPublic ? <Users className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-zinc-400" />}
                          <span>{selectedPlaylist.isPublic ? 'Public' : 'Private'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {selectedPlaylist.tracks?.length || 0} tracks
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {selectedPlaylist.name}
                      </h2>
                      <p className="text-xs text-zenvy-muted leading-relaxed max-w-xl">
                        {selectedPlaylist.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
                      <button
                        onClick={handlePlayAll}
                        className="px-4 py-2.5 rounded-xl bg-zenvy-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 transition-colors duration-200 shadow-lg shadow-emerald-950/30"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                        <span>Play All</span>
                      </button>
                    )}

                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="px-3.5 py-2.5 rounded-xl bg-[#25252B] hover:bg-[#303036] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tracks</span>
                    </Link>

                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="px-3.5 py-2.5 rounded-xl bg-[#25252B] hover:bg-[#303036] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </Link>

                    <button
                      onClick={() => setPlaylistToDelete(selectedPlaylist)}
                      className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      title="Delete this playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Track List inside Playlist */}
                {selectedPlaylist.tracks?.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedPlaylist.tracks.map((track, idx) => {
                      const trackId = track.videoId || track.id;
                      return (
                        <div
                          key={trackId || idx}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-[#141416] hover:bg-[#222226] transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <span className="text-xs text-zinc-500 w-5 text-center font-mono">
                              {idx + 1}
                            </span>
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                              <img
                                src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/music/${trackId}`}
                                className="block text-xs sm:text-sm font-semibold text-white hover:text-zenvy-primary truncate"
                              >
                                {track.title}
                              </Link>
                              <p className="text-[11px] text-zenvy-muted truncate mt-0.5">
                                {track.channelTitle || 'Artist'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => playTrack(track)}
                              className="w-8 h-8 rounded-lg bg-zenvy-primary text-white hover:bg-emerald-300 flex items-center justify-center transition-colors duration-200 shadow-md font-bold"
                              title="Play"
                            >
                              <Play className="w-3.5 h-3.5 fill-current text-white ml-0.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveTrack(trackId)}
                              className="w-8 h-8 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
                              title="Remove track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#25252B] flex items-center justify-center text-zinc-500 mx-auto">
                      <Music className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">This playlist is empty</h4>
                    <p className="text-xs text-zenvy-muted max-w-sm mx-auto">
                      Add tracks from your Liked Songs or discover new tracks across the library.
                    </p>
                    <Link
                      to={`/playlist/${selectedPlaylist.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold mt-2 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tracks Now</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zenvy-muted text-center py-16">Select a playlist to view tracks</p>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create New Playlist with Frosted Backdrop */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md bg-[#1C1C1F] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Glow in top-right corner of card */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 relative z-10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <span>Create New Playlist</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#25252B] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Focus Coding"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121214] text-white text-xs focus:outline-none focus:ring-1 focus:ring-zenvy-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="What is this playlist for?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121214] text-white text-xs focus:outline-none focus:ring-1 focus:ring-zenvy-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newName.trim()}
                  className="px-4 py-2 rounded-xl bg-zenvy-primary hover:bg-emerald-400 text-white text-xs font-bold disabled:opacity-50 shadow"
                >
                  {submitting ? 'Creating...' : 'Create & Open Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Playlist */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-sm bg-[#1C1C1F] rounded-2xl p-6 shadow-2xl relative space-y-4 overflow-hidden">
            {/* Glow in top-right corner */}
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
              Are you sure you want to delete <strong className="text-white">"{playlistToDelete.name}"</strong>? All track listings in this playlist will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlaylistToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlaylist}
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

export default Playlists;
