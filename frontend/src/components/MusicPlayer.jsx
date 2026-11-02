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

// Formatter waktu akurat (mendukung detik, menit, jam)
const formatTime = (secs) => {
  if (secs === null || secs === undefined || isNaN(secs) || secs < 0) return '0:00';
  const total = Math.floor(secs);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const padSec = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const padMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${padMin}:${padSec}`;
  }
  return `${minutes}:${padSec}`;
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
    closePlayer 
  } = usePlayer();

  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [modalMusic, setModalMusic] = useState(null);
  const [scrubTime, setScrubTime] = useState(null);

  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const isScrubbingRef = useRef(false);
  const isLoopRef = useRef(isLoop);
  const prevIsPlayingRef = useRef(isPlaying);
  const prevTrackIdRef = useRef(null);

  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  const trackId = currentTrack?.videoId || currentTrack?.id;

  // Helper untuk mengirim perintah postMessage langsung ke iframe YouTube
  const sendYTCommand = (func, args = []) => {
    const iframe = iframeRef.current || document.getElementById('zenvy-youtube-player-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args,
          }),
          '*'
        );
      } catch {}
    }
  };

  // 1. Muat skrip YouTube Iframe API satu kali secara aman
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      window.onYouTubeIframeAPIReady = () => {
        setupYTPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      setupYTPlayer();
    }
  }, []);

  // 2. Setup YouTube Player Instance (Layer 2 untuk kontrol mendalam)
  const setupYTPlayer = () => {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
    const iframeEl = iframeRef.current || document.getElementById('zenvy-youtube-player-iframe');
    if (!iframeEl) return;

    try {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(iframeEl, {
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
            } catch {}
          },
          onStateChange: (event) => {
            if (event.data === 1) { // PLAYING
              setIsPlaying(true);
              try {
                const dur = event.target.getDuration();
                if (typeof dur === 'number' && dur > 0) {
                  setDuration(Math.floor(dur));
                }
              } catch {}
            } else if (event.data === 2) { // PAUSED
              setIsPlaying(false);
            } else if (event.data === 0) { // ENDED
              if (isLoopRef.current) {
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
      console.warn('YT player initialization notice:', e);
    }
  };

  // 3. Listener HTML5 postMessage YouTube Telemetry (Zero-lag, 100% Real-time)
  useEffect(() => {
    const handleWindowMessage = (e) => {
      try {
        let data = e.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (!data || typeof data !== 'object') return;

        // Telemetri infoDelivery: YouTube mengirim currentTime dan duration secara periodik
        if (data.event === 'infoDelivery' && data.info) {
          const { currentTime: ytTime, duration: ytDur, playerState: ytState } = data.info;

          if (typeof ytDur === 'number' && !isNaN(ytDur) && ytDur > 0) {
            setDuration(Math.floor(ytDur));
          }

          if (typeof ytTime === 'number' && !isNaN(ytTime) && !isScrubbingRef.current) {
            setCurrentTime(Math.floor(ytTime));
          }

          if (ytState === 1) {
            setIsPlaying(true);
          } else if (ytState === 2) {
            setIsPlaying(false);
          } else if (ytState === 0) {
            if (isLoopRef.current) {
              sendYTCommand('seekTo', [0, true]);
              sendYTCommand('playVideo');
            } else {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }
        }

        // Perubahan status pemutar YouTube
        if (data.event === 'onStateChange') {
          const state = data.info;
          if (state === 1) {
            setIsPlaying(true);
          } else if (state === 2) {
            setIsPlaying(false);
          } else if (state === 0) {
            if (isLoopRef.current) {
              sendYTCommand('seekTo', [0, true]);
              sendYTCommand('playVideo');
            } else {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  // 4. Sinkronisasi perubahan lagu (trackId) tanpa merusak DOM iframe
  useEffect(() => {
    if (!isPlayerOpen || !trackId) return;
    setHasError(false);

    if (prevTrackIdRef.current && prevTrackIdRef.current !== trackId) {
      setCurrentTime(0);
      setIsPlaying(true);
      sendYTCommand('loadVideoById', [trackId]);
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(trackId);
        } catch {}
      }
    }
    prevTrackIdRef.current = trackId;
  }, [trackId, isPlayerOpen]);

  // 5. Sinkronisasi Play / Pause dari context ke YouTube
  useEffect(() => {
    if (prevIsPlayingRef.current !== isPlaying) {
      if (isPlaying) {
        sendYTCommand('playVideo');
        if (playerRef.current?.playVideo) {
          try { playerRef.current.playVideo(); } catch {}
        }
      } else {
        sendYTCommand('pauseVideo');
        if (playerRef.current?.pauseVideo) {
          try { playerRef.current.pauseVideo(); } catch {}
        }
      }
      prevIsPlayingRef.current = isPlaying;
    }
  }, [isPlaying]);

  // 6. Polling cadangan (Heartbeat 400ms) untuk memastikan telemetry tetap aktif
  useEffect(() => {
    if (!isPlaying || !isPlayerOpen) return;

    const interval = setInterval(() => {
      if (isScrubbingRef.current) return;

      sendYTCommand('listening');

      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
            setCurrentTime(Math.floor(cur));
          }
          if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
            setDuration(Math.floor(dur));
          }
        } catch {}
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, isPlayerOpen]);

  // 7. Sinkronisasi Lagu Favorit
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
      } catch {}
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

  // 8. Kontrol Tombol Play / Pause Utama
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      sendYTCommand('pauseVideo');
      if (playerRef.current?.pauseVideo) {
        try { playerRef.current.pauseVideo(); } catch {}
      }
    } else {
      setIsPlaying(true);
      sendYTCommand('playVideo');
      if (playerRef.current?.playVideo) {
        try { playerRef.current.playVideo(); } catch {}
      }
    }
  };

  // 9. Tombol Mundur 10 Detik
  const handleRewind10 = () => {
    const cur = scrubTime !== null ? scrubTime : currentTime;
    const target = Math.max(0, cur - 10);
    setCurrentTime(target);
    sendYTCommand('seekTo', [target, true]);
    if (playerRef.current?.seekTo) {
      try { playerRef.current.seekTo(target, true); } catch {}
    }
  };

  // 10. Tombol Maju 10 Detik
  const handleForward10 = () => {
    const cur = scrubTime !== null ? scrubTime : currentTime;
    const maxDur = duration > 0 ? duration : (cur + 10);
    const target = Math.min(maxDur, cur + 10);
    setCurrentTime(target);
    sendYTCommand('seekTo', [target, true]);
    if (playerRef.current?.seekTo) {
      try { playerRef.current.seekTo(target, true); } catch {}
    }
  };

  // 11. Scrubber / Slider Handler Anti-Macet & Anti-Jumping
  const handleSeekStart = (e) => {
    isScrubbingRef.current = true;
    const val = Number(e.target.value);
    setScrubTime(val);

    const handlePointerUp = () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mouseup', handlePointerUp);

      setScrubTime((latestScrub) => {
        const commitTarget = latestScrub !== null ? latestScrub : currentTime;
        setCurrentTime(commitTarget);
        sendYTCommand('seekTo', [commitTarget, true]);
        if (playerRef.current?.seekTo) {
          try { playerRef.current.seekTo(commitTarget, true); } catch {}
        }
        setTimeout(() => {
          isScrubbingRef.current = false;
        }, 300);
        return null;
      });
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('mouseup', handlePointerUp);
  };

  const handleSeekChange = (e) => {
    setScrubTime(Number(e.target.value));
  };

  // 12. Kontrol Volume & Mute
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      sendYTCommand('mute');
      if (playerRef.current?.mute) {
        try { playerRef.current.mute(); } catch {}
      }
    } else {
      setIsMuted(false);
      sendYTCommand('unMute');
      sendYTCommand('setVolume', [val]);
      if (playerRef.current?.setVolume) {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(val);
        } catch {}
      }
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      sendYTCommand('unMute');
      sendYTCommand('setVolume', [volume || 80]);
      if (playerRef.current) {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 80);
        } catch {}
      }
    } else {
      setIsMuted(true);
      sendYTCommand('mute');
      if (playerRef.current) {
        try { playerRef.current.mute(); } catch {}
      }
    }
  };

  const handleIframeLoad = () => {
    sendYTCommand('listening');
    sendYTCommand('setVolume', [volume]);
    if (isMuted) {
      sendYTCommand('mute');
    } else {
      sendYTCommand('unMute');
    }
    if (isPlaying) {
      sendYTCommand('playVideo');
    }
    setupYTPlayer();
  };

  if (!isPlayerOpen || !currentTrack) return null;

  const displayTime = scrubTime !== null ? scrubTime : currentTime;
  const maxTime = duration > 0 ? duration : 100;
  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const iframeSrc = `https://www.youtube-nocookie.com/embed/${trackId}?enablejsapi=1&autoplay=1&playsinline=1&controls=1&origin=${originParam}`;

  return (
    <>
      <aside aria-label="Pemutar Audio Persisten" className="fixed bottom-0 left-0 right-0 z-40 bg-zenvy-sidebar border-t border-zenvy-border shadow-xl">
        
        {/* Layar Video & Audio Player IFrame YouTube Terikat Permanen */}
        <div className={showVideo ? "max-w-4xl mx-auto p-4 border-b border-zenvy-border block" : "fixed -bottom-[9999px] -right-[9999px] w-[320px] h-[180px] pointer-events-none"}>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xl border border-zenvy-border">
            <iframe
              ref={iframeRef}
              id="zenvy-youtube-player-iframe"
              title={currentTrack.title}
              src={iframeSrc}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
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

            {/* Time Scrubber Bar Terikat ke Video (Anti-Macet & Anti-Jumping) */}
            <div className="w-full max-w-lg flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="w-10 text-right">{formatTime(displayTime)}</span>
              <input
                type="range"
                min="0"
                max={maxTime}
                value={Math.min(displayTime, maxTime)}
                onPointerDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseDown={handleSeekStart}
                onChange={handleSeekChange}
                className="w-full h-1 bg-zenvy-border rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition"
              />
              <span className="w-10 text-left">{formatTime(duration)}</span>
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
