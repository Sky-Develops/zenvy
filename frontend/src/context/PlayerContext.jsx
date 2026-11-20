import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MOCK_MUSIC } from '../services/mockData';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Recently played tracks list (Maintains up to 10 tracks)
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const stored = localStorage.getItem('zenvy_recently_played');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed.slice(0, 10);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t) => t.videoId || t.id));
          const fillers = INITIAL_MOCK_MUSIC.filter((t) => !existingIds.has(t.videoId || t.id));
          const merged = [...parsed, ...fillers].slice(0, 10);
          try {
            localStorage.setItem('zenvy_recently_played', JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch (e) {
      console.error('Failed to load recently played tracks', e);
    }
    const defaultTen = INITIAL_MOCK_MUSIC.slice(0, 10);
    try {
      localStorage.setItem('zenvy_recently_played', JSON.stringify(defaultTen));
    } catch {}
    return defaultTen;
  });

  // Play track and open player
  const playTrack = (track) => {
    if (!track) return;
    const newId = track?.videoId || track?.id;
    const currentId = currentTrack?.videoId || currentTrack?.id;

    // Track recently played (Up to 10 tracks)
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => (t.videoId || t.id) !== newId);
      const updated = [track, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('zenvy_recently_played', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recently played', e);
      }
      return updated;
    });

    if (currentId && newId && currentId === newId) {
      setIsPlaying(true);
      setIsPlayerOpen(true);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    setIsPlayerOpen(true);
    setCurrentTime(0);
    setDuration(track.durationSec || 0);
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

  // Keyboard shortcut: Spacebar to toggle playback
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
        recentlyPlayed,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setIsShuffle,
        setIsLoop,
        setVolume,
        setIsMuted,
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
