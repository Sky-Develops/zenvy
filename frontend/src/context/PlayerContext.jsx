import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Play track and initialize telemetry
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsPlayerOpen(true);
    setCurrentTime(0);
    setDuration(track.durationSec || 240);
  };

  const pauseTrack = () => setIsPlaying(false);

  const resumeTrack = () => {
    if (currentTrack) setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setIsPlaying(false);
  };

  const seekTo = (seconds) => {
    setCurrentTime(seconds);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Simulate progress playback ticker
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (isLoop) return 0;
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, isLoop]);

  // Global Keyboard shortcuts: Spacebar to toggle playback (when not inside input/textarea)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
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
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
