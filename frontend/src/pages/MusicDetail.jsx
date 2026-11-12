import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  Share2, 
  Check, 
  AlertCircle, 
  Music, 
  Play,
  Pause
} from 'lucide-react';
import { musicApi, favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const MusicDetail = () => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [similarTracks, setSimilarTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const trackId = track?.videoId || track?.id || id;
  const isCurrentActive = (currentTrack?.videoId || currentTrack?.id) === trackId;

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await musicApi.getDetail(id);
      setTrack(data);

      const [favs, allList] = await Promise.all([
        favoritesApi.getAll().catch(() => []),
        musicApi.search('')
      ]);

      const tId = data.videoId || data.id || id;
      setIsFavorite(favs.some(f => (f.videoId || f.id) === tId));
      setSimilarTracks(allList.filter(item => (item.videoId || item.id) !== tId));
    } catch (err) {
      setError('Failed to load track information.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!track) return;
    const tId = track.videoId || track.id || id;
    try {
      if (isFavorite) {
        await favoritesApi.remove(tId);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(track);
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMainActionPlay = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading track information..." size="lg" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Track Not Found</h2>
        <p className="text-sm text-zenvy-muted">{error || 'This track is currently unavailable.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvy-primary text-white text-xs font-bold hover:bg-emerald-400 transition shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-[#1C1C1F] hover:bg-[#25252B] transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1C1C1F] hover:bg-[#25252B] text-zinc-300 hover:text-white transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-zenvy-primary" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Header Showcase Banner with Ambient Glow in Top-Right Corner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/30 via-[#1C1C1F] to-[#121214] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/15 filter blur-3xl pointer-events-none" />

        <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl bg-black">
          <img
            src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 space-y-3 text-center md:text-left flex-1 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {track.title}
          </h1>

          <p className="text-sm text-zenvy-muted font-medium">
            By <span className="text-white font-semibold">{track.channelTitle || 'YouTube Artist'}</span>
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handleMainActionPlay}
              className="px-6 py-2.5 rounded-xl bg-zenvy-primary hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2.5 transition-colors duration-200 shadow-xl shadow-emerald-950/30"
            >
              {isCurrentActive && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current text-white" />
                  <span>Pause Track</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>Play Track</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
                isFavorite
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-[#25252B] hover:bg-[#303036] text-zinc-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
              <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={() => setShowPlaylistModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#25252B] hover:bg-[#303036] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Media Player Canvas & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8: Media Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl group">
            <img
              src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
              alt={track.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCurrentActive && isPlaying ? 'opacity-85' : 'opacity-70 group-hover:opacity-90'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
              <button
                onClick={handleMainActionPlay}
                className="w-16 h-16 rounded-full bg-zenvy-primary hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/30 transition-colors duration-200"
                title={isCurrentActive && isPlaying ? 'Pause Audio' : 'Play Audio'}
              >
                {isCurrentActive && isPlaying ? (
                  <Pause className="w-7 h-7 fill-current text-white" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1 text-white" />
                )}
              </button>
              <span className="text-xs font-semibold text-white px-3 py-1 rounded-full bg-black/70 backdrop-blur-md shadow">
                {isCurrentActive && isPlaying ? 'Now Playing in Bottom Bar' : 'Click to Play Audio'}
              </span>
            </div>
          </div>

          {/* Track Synopsis */}
          <div className="bg-[#1C1C1F] rounded-2xl p-6 space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Track Overview & Notes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {track.description || 'High-fidelity audio stream for concentration, relaxation, and focus sessions.'}
            </p>
          </div>
        </div>

        {/* Right 4: Similar Tracks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1C1C1F] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Similar Recommendations
              </h3>
            </div>

            <div className="space-y-2">
              {similarTracks.slice(0, 4).map((sim) => {
                const simId = sim.videoId || sim.id;
                return (
                  <div
                    key={simId}
                    onClick={() => playTrack(sim)}
                    className="p-2.5 rounded-xl bg-[#141416] hover:bg-[#24242A] flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={sim.thumbnailUrl}
                        alt={sim.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white group-hover:text-zenvy-primary truncate">
                          {sim.title}
                        </h4>
                        <p className="text-[10px] text-zenvy-muted truncate mt-0.5">{sim.channelTitle}</p>
                      </div>
                    </div>

                    <button
                      className="w-7 h-7 rounded-lg bg-[#25252B] group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center transition"
                      title="Play"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        music={track}
        onClose={() => setShowPlaylistModal(false)}
      />
    </div>
  );
};

export default MusicDetail;
