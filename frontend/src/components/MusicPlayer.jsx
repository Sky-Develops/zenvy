import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Radio, 
  Shuffle, 
  Repeat, 
  RotateCcw, 
  RotateCw,
  Heart,
  Plus
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { favoritesApi } from '../services/api';
import AddToPlaylistModal from './AddToPlaylistModal';

const formatTime = (secs) => {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    isPlayerOpen, 
    currentTime, 
    duration,
    isShuffle,
    isLoop,
    volume,
    isMuted,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsShuffle,
    setIsLoop,
    setVolume,
    setIsMuted,
    toggleMute,
    togglePlay, 
    closePlayer 
  } = usePlayer();

  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [modalMusic, setModalMusic] = useState(null);

  const playerRef = useRef(null);
  const isScrubbingRef = useRef(false);

  const trackId = currentTrack?.videoId || currentTrack?.id;

  // 1. Muat YouTube Iframe API script sekali
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // 2. Setup YouTube Player Instance
  const setupYTPlayer = () => {
    if (!window.YT || !window.YT.Player) return;
    const iframeEl = document.getElementById('zenvy-youtube-player-iframe');
    if (!iframeEl) return;

    try {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
      }

      playerRef.current = new window.YT.Player('zenvy-youtube-player-iframe', {
        events: {
          onReady: (event) => {
            try {
              event.target.setVolume(volume);
              if (isMuted) event.target.mute();
              if (isPlaying) event.target.playVideo();
              const dur = event.target.getDuration();
              if (typeof dur === 'number' && dur > 0) {
                setDuration(Math.floor(dur));
              }
            } catch (err) {
              console.warn('onReady notice:', err);
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
            if (event.data === 1) {
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (typeof dur === 'number' && dur > 0) {
                setDuration(Math.floor(dur));
              }
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              if (isLoop) {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                setIsPlaying(false);
                setCurrentTime(0);
              }
            }
          },
          onError: () => {
            setHasError(true);
          }
        }
      });
    } catch (e) {
      console.warn('YT player initialization error:', e);
    }
  };

  // 3. Re-bind / Load Video saat trackId berganti
  useEffect(() => {
    if (!isPlayerOpen || !trackId) return;
    setHasError(false);
    setCurrentTime(0);

    if (window.YT && window.YT.Player) {
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(trackId);
          playerRef.current.playVideo();
          setIsPlaying(true);
          return;
        } catch {
          // fallback to full setup
        }
      }
      setupYTPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        setupYTPlayer();
      };
    }
  }, [trackId, isPlayerOpen]);

  // 4. Sinkronisasi Waktu Nyata dari Video YouTube ke Slider (Setiap 350ms)
  useEffect(() => {
    let interval = null;
    if (isPlaying && isPlayerOpen) {
      interval = setInterval(() => {
        if (isScrubbingRef.current) return;
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            if (typeof cur === 'number' && !isNaN(cur)) {
              setCurrentTime(Math.floor(cur));
            }
            if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
              setDuration(Math.floor(dur));
            }
          } catch {
            // ignore
          }
        }
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerOpen]);

  // 5. Sinkronisasi Favorit Persisten
  useEffect(() => {
    let isMounted = true;
    const syncFav = async () => {
      if (!currentTrack) {
        setIsFav(false);
        return;
      }
      try {
        const list = await favoritesApi.getAll();
        const tid = currentTrack.videoId || currentTrack.id;
        if (isMounted) {
          setIsFav(list.some(f => (f.videoId || f.id) === tid));
        }
      } catch {
        // ignore
      }
    };
    syncFav();
    return () => { isMounted = false; };
  }, [currentTrack]);

  const handleToggleFavoriteInPlayer = async () => {
    if (!currentTrack) return;
    const tid = currentTrack.videoId || currentTrack.id;
    try {
      if (isFav) {
        await favoritesApi.remove(tid);
        setIsFav(false);
      } else {
        await favoritesApi.add(currentTrack);
        setIsFav(true);
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  // 6. Tombol Play / Pause yang Terikat Langsung ke Video
  const handleTogglePlay = () => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        const state = playerRef.current.getPlayerState();
        if (state === 1) { // Sedang berputar
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
        return;
      } catch {}
    }
    togglePlay();
  };

  // 7. Tombol Mundur 10 Detik Terikat ke Video
  const handleRewind10 = () => {
    let cur = currentTime;
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try { cur = playerRef.current.getCurrentTime(); } catch {}
    }
    const target = Math.max(0, Math.floor(cur) - 10);
    setCurrentTime(target);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try { playerRef.current.seekTo(target, true); } catch {}
    }
  };

  // 8. Tombol Maju 10 Detik Terikat ke Video
  const handleForward10 = () => {
    let cur = currentTime;
    let dur = duration;
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try { 
        cur = playerRef.current.getCurrentTime();
        dur = playerRef.current.getDuration();
      } catch {}
    }
    const target = Math.min(dur || cur + 10, Math.floor(cur) + 10);
    setCurrentTime(target);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try { playerRef.current.seekTo(target, true); } catch {}
    }
  };

  // 9. Slider Seeking yang Mengontrol Posisi Video
  const handleSeekChange = (e) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
  };

  const handleSeekCommit = (e) => {
    isScrubbingRef.current = false;
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try { playerRef.current.seekTo(val, true); } catch {}
    }
  };

  const handleSeekStart = () => {
    isScrubbingRef.current = true;
  };

  // 10. Kontrol Volume & Mute Terikat ke Video
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        if (val === 0) {
          playerRef.current.mute();
          setIsMuted(true);
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(val);
          setIsMuted(false);
        }
      } catch {}
    }
  };

  const handleToggleMute = () => {
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 80);
          setIsMuted(false);
        } else {
          playerRef.current.mute();
          setIsMuted(true);
        }
        return;
      } catch {}
    }
    toggleMute();
  };

  if (!isPlayerOpen || !currentTrack) return null;

  return (
    <>
      <aside aria-label="Pemutar Audio Persisten" className="fixed bottom-0 left-0 right-0 z-40 bg-zenvy-sidebar border-t border-zenvy-border shadow-xl">
        
        {/* Layar Video & Audio Player IFrame YouTube Terikat */}
        <div className={showVideo ? "max-w-4xl mx-auto p-4 border-b border-zenvy-border block" : "fixed -bottom-[9999px] -right-[9999px] w-[320px] h-[180px] pointer-events-none"}>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xl border border-zenvy-border">
            <iframe
              id="zenvy-youtube-player-iframe"
              key={trackId}
              title={currentTrack.title}
              src={`https://www.youtube-nocookie.com/embed/${trackId}?enablejsapi=1&autoplay=1&playsinline=1&controls=1`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Spanduk Notifikasi Error Pemutaran */}
        {hasError && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Catatan pemutaran: Embed dibatasi hak cipta YouTube. Audio stream tetap dicoba diputar.</span>
          </div>
        )}

        {/* Grid 3-Zona Pemutar Audio */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-12 items-center gap-4">
          
          {/* ZONA 1 (Kiri 3 Kolom): Info Lagu */}
          <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black border border-zenvy-border shadow-sm">
              <img
                src={currentTrack.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <Link
                to={`/music/${trackId}`}
                className="block text-xs sm:text-sm font-semibold text-white hover:text-zinc-300 truncate"
              >
                {currentTrack.title}
              </Link>
              <p className="text-[11px] text-zenvy-muted truncate">
                {currentTrack.channelTitle || 'Artis'}
              </p>
              {currentTrack.musicalKey && (
                <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                  <span className="font-mono text-zinc-300">{currentTrack.musicalKey}</span>
                  <span>•</span>
                  <span className="font-mono text-zinc-400">{currentTrack.bpm || 80} BPM</span>
                </div>
              )}
            </div>

            {/* Tombol Simpan Favorit & Tambah Playlist di Player */}
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={handleToggleFavoriteInPlayer}
                className={`p-1.5 rounded transition ${
                  isFav ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-red-400 hover:bg-zenvy-cardElevated'
                }`}
                title={isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-red-500' : ''}`} />
              </button>

              <button
                onClick={() => setModalMusic(currentTrack)}
                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zenvy-cardElevated transition"
                title="Tambahkan ke Playlist Saya"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ZONA 2 (Tengah 6 Kolom): Kontrol Putar & Bilah Waktu Terikat 100% */}
          <div className="col-span-5 sm:col-span-6 flex flex-col items-center gap-1.5">
            
            {/* Tombol Kontrol Nyata */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1 rounded text-xs transition ${
                  isShuffle ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Acak Trek"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRewind10}
                className="p-1 rounded text-zinc-400 hover:text-white transition"
                title="Mundur 10 Detik Video"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-9 h-9 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow transition"
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current text-black" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                )}
              </button>

              <button
                onClick={handleForward10}
                className="p-1 rounded text-zinc-400 hover:text-white transition"
                title="Maju 10 Detik Video"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={`p-1 rounded text-xs transition ${
                  isLoop ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Ulangi Lagu Ini"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Scrubber Bar Terikat ke Video */}
            <div className="w-full max-w-lg flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="w-9 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                value={currentTime}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="w-full h-1 bg-zenvy-border rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition"
              />
              <span className="w-9 text-left">{formatTime(duration)}</span>
            </div>
          </div>

          {/* ZONA 3 (Kanan 3 Kolom): Solid Badge, Layar Video & Volume Terikat */}
          <div className="col-span-3 flex items-center justify-end gap-2.5">
            
            {/* Lencana Solid */}
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zenvy-card text-zinc-300 border border-zenvy-border">
              320k OPUS
            </span>

            {/* Tombol Tampilkan Layar Video */}
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                showVideo
                  ? 'bg-zenvy-cardElevated border-zinc-500 text-white'
                  : 'bg-zenvy-card border-zenvy-border text-zinc-400 hover:text-white'
              }`}
              title={showVideo ? 'Tutup Layar Video' : 'Buka Layar Video YouTube'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Pengatur Volume Suara */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="text-zinc-400 hover:text-white p-1"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zenvy-border rounded-lg appearance-none cursor-pointer accent-zinc-300"
              />
            </div>

            <button
              onClick={closePlayer}
              className="p-1 text-zinc-400 hover:text-white transition"
              title="Tutup Pemutar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Tambahkan ke Playlist */}
      <AddToPlaylistModal
        isOpen={!!modalMusic}
        music={modalMusic}
        onClose={() => setModalMusic(null)}
      />
    </>
  );
};

export default MusicPlayer;
