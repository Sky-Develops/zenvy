import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  X, 
  Maximize2, 
  Minimize2,
  Video,
  VideoOff,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [modalMusic, setModalMusic] = useState(null);
  const [scrubTime, setScrubTime] = useState(null);

  const iframeRef = useRef(null);
  const videoContainerRef = useRef(null);
  const playerRef = useRef(null);
  const isScrubbingRef = useRef(false);
  const pendingSeekRef = useRef(null);
  const seekTimeoutRef = useRef(null);
  const isLoopRef = useRef(isLoop);
  const prevIsPlayingRef = useRef(isPlaying);
  const prevTrackIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

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

          if (typeof ytTime === 'number' && !isNaN(ytTime)) {
            if (isScrubbingRef.current) return;

            if (pendingSeekRef.current !== null) {
              if (Math.abs(ytTime - pendingSeekRef.current) <= 2) {
                pendingSeekRef.current = null;
                setCurrentTime(Math.floor(ytTime));
              }
              return;
            }

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
      setScrubTime(null);
      pendingSeekRef.current = null;
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

      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
            if (pendingSeekRef.current !== null) {
              if (Math.abs(cur - pendingSeekRef.current) <= 2) {
                pendingSeekRef.current = null;
                setCurrentTime(Math.floor(cur));
              }
            } else {
              setCurrentTime(Math.floor(cur));
            }
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

  // Helper sentral untuk commit seek ke posisi waktu yang dipilih
  const commitSeek = (targetSec) => {
    const dur = duration > 0 ? duration : (currentTrack?.durationSec || 100);
    const validTarget = Math.max(0, Math.min(Math.round(targetSec), dur));

    // 1. Perbarui state lokal secara instan agar slider & label waktu tidak jump
    setCurrentTime(validTarget);
    setScrubTime(null);
    isScrubbingRef.current = false;

    // 2. Kunci telemetry agar waktu lama dari YouTube yang sedang buffering tidak merusak slider
    pendingSeekRef.current = validTarget;
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    seekTimeoutRef.current = setTimeout(() => {
      pendingSeekRef.current = null;
    }, 2000);

    // 3. Kirim instruksi seekTo ke YouTube iframe via postMessage & YT API
    sendYTCommand('seekTo', [validTarget, true]);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(validTarget, true);
      } catch {}
    }
  };

  // 9. Tombol Mundur 10 Detik
  const handleRewind10 = () => {
    const cur = scrubTime !== null ? scrubTime : currentTime;
    commitSeek(cur - 10);
  };

  // 10. Tombol Maju 10 Detik
  const handleForward10 = () => {
    const cur = scrubTime !== null ? scrubTime : currentTime;
    commitSeek(cur + 10);
  };

  // 11. Scrubber / Slider Handler Presisi (Anti-Macet, Anti-Jumping & Bebas Bug)
  const handleSeekPointerDown = (e) => {
    isScrubbingRef.current = true;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleSeekChange = (e) => {
    const val = Number(e.target.value);
    setScrubTime(val);
  };

  const handleSeekCommit = (e) => {
    const val = Number(e.target.value);
    try {
      if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch {}
    commitSeek(val);
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
    // Daftarkan listener telemetri postMessage dengan format top-level event resmi YouTube
    const iframe = iframeRef.current || document.getElementById('zenvy-youtube-player-iframe');
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      } catch {}
    }

    // Terapkan properti awal audio secara aman tanpa memicu crash API dispatcher
    setTimeout(() => {
      sendYTCommand('setVolume', [volume]);
      if (isMuted) {
        sendYTCommand('mute');
      } else {
        sendYTCommand('unMute');
      }
      if (isPlaying) {
        sendYTCommand('playVideo');
      }
    }, 150);
  };

  if (!isPlayerOpen || !currentTrack) return null;

  const displayTime = scrubTime !== null ? scrubTime : currentTime;
  const effectiveDuration = duration > 0 ? duration : (currentTrack?.durationSec || 0);
  const maxTime = effectiveDuration > 0 ? effectiveDuration : 100;
  const progressPercent = maxTime > 0 ? Math.min(100, Math.max(0, (displayTime / maxTime) * 100)) : 0;
  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const iframeSrc = `https://www.youtube.com/embed/${trackId}?enablejsapi=1&autoplay=1&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&origin=${originParam}`;

  return (
    <>
      <aside aria-label="Persistent Audio Player" className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1C1F]/90 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
        
        {/* Seamless Video Layer with backdrop blur */}
        <div className={showVideo ? "max-w-4xl mx-auto p-4 border-b border-white/10 block animate-fade-in" : "fixed -bottom-[9999px] -right-[9999px] w-[320px] h-[180px] pointer-events-none"}>
          <div 
            ref={videoContainerRef} 
            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl group select-none"
          >
            <iframe
              ref={iframeRef}
              id="zenvy-youtube-player-iframe"
              title={currentTrack.title}
              src={iframeSrc}
              className="w-full h-full border-0 pointer-events-none select-none"
              tabIndex={-1}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />

            {/* Interactive Overlay */}
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center transition-colors hover:bg-black/30 backdrop-blur-[1px]"
              title={isPlaying ? "Click to Pause" : "Click to Play"}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-zenvy-primary text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-colors duration-200">
                  <Play className="w-8 h-8 fill-current ml-1 text-white" />
                </div>
              )}
            </div>

            {/* Video Top Controls */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="w-8 h-8 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md transition shadow flex items-center justify-center"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(false);
                }}
                className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md transition flex items-center justify-center"
                title="Close Video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Playback Error / Restriction Banner */}
        {hasError && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Playback notice: Embed restricted by provider. Audio playback remains active.</span>
          </div>
        )}

        {/* 3-Zone Audio Player Grid */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-12 items-center gap-4">
          
          {/* ZONE 1 (Left 3 Columns): Track Info */}
          <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black shadow-md">
              <img
                src={currentTrack.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-zenvy-primary" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <Link
                to={`/music/${trackId}`}
                className="block text-xs sm:text-sm font-semibold text-zenvy-text hover:text-white truncate"
              >
                {currentTrack.title}
              </Link>
              <p className="text-[11px] text-zenvy-muted truncate">
                {currentTrack.channelTitle || 'Artist'}
              </p>
            </div>

            {/* Like & Add to Playlist Buttons with high-contrast containers */}
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={handleToggleFavoriteInPlayer}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm ${
                  isFav ? 'text-red-500 bg-red-500/15' : 'bg-[#25252B] text-zinc-300 hover:text-red-400 hover:bg-[#303036]'
                }`}
                title={isFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-red-500' : ''}`} />
              </button>

              <button
                onClick={() => setModalMusic(currentTrack)}
                className="w-8 h-8 rounded-lg bg-[#25252B] text-zinc-300 hover:text-white hover:bg-[#303036] flex items-center justify-center transition shadow-sm"
                title="Add to Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ZONE 2 (Center 6 Columns): Playback Controls & Scrubber */}
          <div className="col-span-5 sm:col-span-6 flex flex-col items-center gap-1.5">
            
            {/* Control Buttons with High-Contrast Containers */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition shadow-sm ${
                  isShuffle ? 'text-zenvy-secondary bg-zenvy-secondary/15 font-semibold' : 'bg-[#25252B] text-zinc-400 hover:text-white hover:bg-[#303036]'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRewind10}
                className="w-8 h-8 rounded-lg bg-[#25252B] text-zinc-300 hover:text-white hover:bg-[#303036] flex items-center justify-center transition shadow-sm"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-11 h-11 rounded-full bg-zenvy-primary text-white hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/30 transition-colors duration-200"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current text-white" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                )}
              </button>

              <button
                onClick={handleForward10}
                className="w-8 h-8 rounded-lg bg-[#25252B] text-zinc-300 hover:text-white hover:bg-[#303036] flex items-center justify-center transition shadow-sm"
                title="Forward 10s"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition shadow-sm ${
                  isLoop ? 'text-zenvy-secondary bg-zenvy-secondary/15 font-semibold' : 'bg-[#25252B] text-zinc-400 hover:text-white hover:bg-[#303036]'
                }`}
                title="Repeat Track"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Scrubber Bar */}
            <div className="w-full max-w-lg flex items-center gap-2 text-[11px] font-mono text-zenvy-muted">
              <span className="w-10 text-right">{formatTime(displayTime)}</span>
              <input
                type="range"
                min="0"
                max={maxTime}
                step="1"
                value={Math.min(displayTime, maxTime)}
                onPointerDown={handleSeekPointerDown}
                onPointerUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                onMouseUp={handleSeekCommit}
                onChange={handleSeekChange}
                onKeyUp={handleSeekCommit}
                style={{
                  background: `linear-gradient(to right, #059669 ${progressPercent}%, #27272B ${progressPercent}%)`
                }}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-zenvy-primary transition-all"
              />
              <span className="w-10 text-left">{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* ZONE 3 (Right 3 Columns): Video Toggle, Volume & Close (Without box containers) */}
          <div className="col-span-3 flex items-center justify-end gap-3">
            {/* Video Screen Toggle Button (Expand/Collapse Icon) */}
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`p-1.5 rounded-lg transition-colors ${
                showVideo
                  ? 'text-zenvy-primary hover:text-emerald-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={showVideo ? 'Collapse Video' : 'Expand Video'}
            >
              {showVideo ? (
                <Minimize2 className="w-4 h-4 text-zenvy-primary" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="text-zinc-400 hover:text-white transition"
                title={isMuted ? 'Unmute' : 'Mute'}
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
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-zenvy-primary"
              />
            </div>

            {/* Close Player Button */}
            <button
              onClick={closePlayer}
              className="p-1.5 text-zinc-400 hover:text-white transition"
              title="Close Player"
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
