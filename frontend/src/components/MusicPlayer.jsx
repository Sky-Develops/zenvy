import React, { useState, useEffect } from 'react';
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
  Heart
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const formatTime = (secs) => {
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
    setIsShuffle,
    setIsLoop,
    setVolume,
    toggleMute,
    seekTo,
    togglePlay, 
    closePlayer 
  } = usePlayer();

  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFav, setIsFav] = useState(false);


  useEffect(() => {
    const iframe = document.getElementById('youtube-player-iframe');
    if (!isPlayerOpen || !currentTrack || !iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isPlaying ? 'playVideo' : 'pauseVideo',
          args: []
        }),
        '*'
      );
    } catch (e) {
      // ignore
    }
  }, [isPlaying, isPlayerOpen, currentTrack]);

  useEffect(() => {
    const iframe = document.getElementById('youtube-player-iframe');
    if (!isPlayerOpen || !currentTrack || !iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isMuted ? 'mute' : 'unMute',
          args: []
        }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [isMuted ? 0 : volume]
        }),
        '*'
      );
    } catch (e) {
      // ignore
    }
  }, [volume, isMuted, isPlayerOpen, currentTrack]);

  const handleSeek = (e) => {
    const targetVal = Number(e.target.value);
    seekTo(targetVal);
    const iframe = document.getElementById('youtube-player-iframe');
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [targetVal, true]
          }),
          '*'
        );
      } catch (e) {
        // ignore
      }
    }
  };

  if (!isPlayerOpen || !currentTrack) return null;

  const trackId = currentTrack.videoId || currentTrack.id;

  return (
    <aside aria-label="Pemutar Audio Persisten" className="fixed bottom-0 left-0 right-0 z-40 bg-zenvy-sidebar border-t border-zenvy-border shadow-xl">
      
      {/* Layar Video & Audio Player IFrame YouTube */}
      <div className={showVideo ? "max-w-4xl mx-auto p-4 border-b border-zenvy-border block" : "fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"}>
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xl border border-zenvy-border">
          <iframe
            id="youtube-player-iframe"
            key={trackId}
            title={currentTrack.title}
            src={`https://www.youtube-nocookie.com/embed/${trackId}?autoplay=1&enablejsapi=1`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        </div>
      </div>

      {/* Spanduk Notifikasi Error Pemutaran */}
      {hasError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Catatan pemutaran: Embed dibatasi hak cipta YouTube. Audio stream tetap aktif.</span>
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

          <button
            onClick={() => setIsFav(!isFav)}
            className={`hidden sm:inline-flex p-1.5 rounded transition ${
              isFav ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-red-400'
            }`}
            title="Simpan ke Favorit"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ZONA 2 (Tengah 6 Kolom): Kontrol Putar & Bilah Waktu */}
        <div className="col-span-5 sm:col-span-6 flex flex-col items-center gap-1.5">
          
          {/* Tombol Kontrol */}
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
              onClick={() => seekTo(Math.max(0, currentTime - 10))}
              className="p-1 rounded text-zinc-400 hover:text-white transition"
              title="Mundur 10 Detik"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
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
              onClick={() => seekTo(Math.min(duration, currentTime + 10))}
              className="p-1 rounded text-zinc-400 hover:text-white transition"
              title="Maju 10 Detik"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsLoop(!isLoop)}
              className={`p-1 rounded text-xs transition ${
                isLoop ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Ulangi Lagu"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Scrubber Bar */}
          <div className="w-full max-w-lg flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zenvy-border rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* ZONA 3 (Kanan 3 Kolom): Solid Badge, Layar Video & Volume */}
        <div className="col-span-3 flex items-center justify-end gap-2.5">
          
          {/* Lencana Solid (Tanpa transparansi neon) */}
          <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zenvy-card text-zinc-300 border border-zenvy-border">
            320k OPUS
          </span>

          {/* Tombol Perluas Layar Video */}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              showVideo
                ? 'bg-zenvy-cardElevated border-zinc-500 text-white'
                : 'bg-zenvy-card border-zenvy-border text-zinc-400 hover:text-white'
            }`}
            title={showVideo ? 'Sembunyikan Layar Video' : 'Buka Layar Video YouTube'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Pengatur Volume Suara */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
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
              onChange={(e) => setVolume(Number(e.target.value))}
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
  );
};

export default MusicPlayer;
