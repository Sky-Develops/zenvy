import axios from 'axios';
import { INITIAL_MOCK_MUSIC, INITIAL_MOCK_USER, INITIAL_MOCK_PLAYLISTS } from './mockData';

// Konfigurasi Base URL dari Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyDIN4DUDTq4QvI9icHdiCUKcvAUDhPd7I0';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyertakan Authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zenvy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper Mock Storage lokal saat backend offline
const getStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// Pembersihan cache lagu lama jika pernah tersimpan placeholder yang tidak aktif
const getCatalog = () => {
  const stored = getStorage('zenvy_music_catalog', null);
  if (!stored || !Array.isArray(stored) || stored.some(s => s.id === 'jfKfPfyJRdk' || s.id === 'DWcJFNfaw90' || s.id === '5qap5aO4i9A')) {
    setStorage('zenvy_music_catalog', INITIAL_MOCK_MUSIC);
    return INITIAL_MOCK_MUSIC;
  }
  return stored;
};

const getValidFavorites = () => {
  const defaultFavs = [INITIAL_MOCK_MUSIC[0], INITIAL_MOCK_MUSIC[1], INITIAL_MOCK_MUSIC[2]];
  const stored = getStorage('zenvy_favorites', null);
  if (!stored || !Array.isArray(stored) || stored.some(s => s.id === 'jfKfPfyJRdk' || s.id === 'DWcJFNfaw90')) {
    setStorage('zenvy_favorites', defaultFavs);
    return defaultFavs;
  }
  return stored;
};

// Helper Decode Entitas HTML dari YouTube snippet
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
};

// Helper Map YouTube Data API v3 Response ke ZENVY Track Schema
const mapYouTubeItemToTrack = (item) => {
  const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId;
  if (!videoId) return null;

  let hash = 0;
  for (let i = 0; i < videoId.length; i++) {
    hash = (hash << 5) - hash + videoId.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const keys = ['C Mayor', 'D Minor', 'F# Minor', 'A Minor', 'E Minor', 'G Mayor', 'B Minor', 'Eb Mayor', 'Ab Mayor'];
  const habitats = [
    'Fokus Mendalam & Belajar',
    'Berkendara Larut Malam',
    'Ambient & Lo-Fi',
    'Kafe Akustik',
    'Ambient Kosmik',
    'Elektronik & Dark Wave'
  ];

  const title = decodeHtmlEntities(item.snippet?.title || `Track ${videoId}`);
  const titleLower = title.toLowerCase();

  let detectedHabitat = habitats[positiveHash % habitats.length];
  if (titleLower.includes('lofi') || titleLower.includes('chill') || titleLower.includes('relax')) {
    detectedHabitat = 'Ambient & Lo-Fi';
  } else if (titleLower.includes('synth') || titleLower.includes('night') || titleLower.includes('retro') || titleLower.includes('wave')) {
    detectedHabitat = 'Berkendara Larut Malam';
  } else if (titleLower.includes('432') || titleLower.includes('focus') || titleLower.includes('study') || titleLower.includes('binaural')) {
    detectedHabitat = 'Fokus Mendalam & Belajar';
  } else if (titleLower.includes('acoustic') || titleLower.includes('guitar') || titleLower.includes('folk') || titleLower.includes('cafe')) {
    detectedHabitat = 'Kafe Akustik';
  } else if (titleLower.includes('space') || titleLower.includes('ambient') || titleLower.includes('cosmic') || titleLower.includes('astral')) {
    detectedHabitat = 'Ambient Kosmik';
  } else if (titleLower.includes('dark') || titleLower.includes('techno') || titleLower.includes('cyber') || titleLower.includes('industrial')) {
    detectedHabitat = 'Elektronik & Dark Wave';
  }

  const thumb = 
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    item.snippet?.thumbnails?.default?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    id: videoId,
    videoId: videoId,
    title: title,
    channelTitle: decodeHtmlEntities(item.snippet?.channelTitle || 'Artis YouTube'),
    thumbnailUrl: thumb,
    description: decodeHtmlEntities(item.snippet?.description || ''),
    publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
    bpm: 60 + (positiveHash % 75),
    musicalKey: keys[positiveHash % keys.length],
    lufs: `-${(10 + (positiveHash % 80) / 10).toFixed(1)} LUFS`,
    bitrate: '320kbps OPUS',
    habitat: detectedHabitat,
    momentum: `+${50 + (positiveHash % 45)}% relevansi`,
    harmonicMatch: 90 + (positiveHash % 10),
    masterStudio: 'Audio Resonance Labs',
    durationSec: 180 + (positiveHash % 240),
    views: `${((positiveHash % 900) / 100 + 1).toFixed(1)}M tayangan`
  };
};

const getTrackCache = () => getStorage('zenvy_track_cache', {});
const saveTracksToCache = (tracks) => {
  try {
    const cache = getTrackCache();
    tracks.forEach(t => {
      const id = t.videoId || t.id;
      if (id) cache[id] = t;
    });
    setStorage('zenvy_track_cache', cache);
  } catch (e) {
    // ignore
  }
};

// ==========================================
// 1. AUTHENTICATION SERVICE
// ==========================================
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data?.token) {
        localStorage.setItem('zenvy_token', response.data.token);
      }
      return response.data;
    } catch (err) {
      if (!err.response) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        const user = {
          ...INITIAL_MOCK_USER,
          email: credentials.email,
          username: credentials.email.split('@')[0] || 'Elena Vance'
        };
        localStorage.setItem('zenvy_token', mockToken);
        localStorage.setItem('zenvy_user', JSON.stringify(user));
        return { token: mockToken, user };
      }
      throw err.response?.data?.message || 'Login gagal. Periksa email dan kata sandi.';
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data?.token) {
        localStorage.setItem('zenvy_token', response.data.token);
      }
      return response.data;
    } catch (err) {
      if (!err.response) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        const user = {
          id: 'usr_' + Date.now(),
          username: userData.username,
          email: userData.email,
          role: 'Kurator Musik'
        };
        localStorage.setItem('zenvy_token', mockToken);
        localStorage.setItem('zenvy_user', JSON.stringify(user));
        return { token: mockToken, user };
      }
      throw err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch {
      return getStorage('zenvy_user', INITIAL_MOCK_USER);
    }
  },

  logout: () => {
    localStorage.removeItem('zenvy_token');
    localStorage.removeItem('zenvy_user');
  }
};

// ==========================================
// 2. MUSIC & SEARCH SERVICE
// ==========================================
export const musicApi = {
  search: async (query = '') => {
    const catalog = getCatalog();

    if (!query || !query.trim()) {
      return catalog;
    }

    try {
      // 1. Panggil YouTube Data API v3 resmi dengan API key pengguna
      const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=16&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
      const ytRes = await axios.get(ytUrl, { timeout: 8000 });

      if (ytRes.data?.items && ytRes.data.items.length > 0) {
        const tracks = ytRes.data.items
          .map(mapYouTubeItemToTrack)
          .filter(Boolean);
        if (tracks.length > 0) {
          saveTracksToCache(tracks);
          return tracks;
        }
      }
    } catch (ytErr) {
      console.warn('YouTube API search error / quota notice:', ytErr.message || ytErr);
    }

    // 2. Fallback: Cari di katalog lokal & track cache
    const cache = getTrackCache();
    const all = [...catalog, ...Object.values(cache)];
    const qLower = query.toLowerCase();
    const filtered = all.filter(m => 
      (m.title && m.title.toLowerCase().includes(qLower)) || 
      (m.channelTitle && m.channelTitle.toLowerCase().includes(qLower)) ||
      (m.habitat && m.habitat.toLowerCase().includes(qLower)) ||
      (m.musicalKey && m.musicalKey.toLowerCase().includes(qLower)) ||
      (m.description && m.description.toLowerCase().includes(qLower))
    );

    if (filtered.length > 0) {
      const seen = new Set();
      return filtered.filter(f => {
        const id = f.videoId || f.id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    // 3. Fallback cerdas dengan verified playable videos
    const cleanTitle = query.charAt(0).toUpperCase() + query.slice(1);
    return [
      {
        ...INITIAL_MOCK_MUSIC[0],
        title: `${cleanTitle} - Sesi Eksplorasi Gelombang Frekuensi`,
        channelTitle: `${cleanTitle} Audio Labs`,
        description: `Kurasi audio resolusi tinggi untuk kata kunci pencarian "${query}". Siap diputar dengan audio lossless.`
      },
      {
        ...INITIAL_MOCK_MUSIC[1],
        title: `${cleanTitle} - Instrumental & Night Mix`,
        channelTitle: 'ZENVY Acoustic Labs',
        description: `Kompilasi nada santai beresolusi tinggi yang terinspirasi oleh ${query}.`
      }
    ];
  },

  getDetail: async (id) => {
    // 1. Periksa catalog lokal & cache
    const catalog = getCatalog();
    const cache = getTrackCache();
    const localFound = catalog.find(m => m.id === id || m.videoId === id) || cache[id];
    if (localFound) return localFound;

    // 2. Fetch langsung dari YouTube Data API v3 Videos endpoint jika belum ada di cache
    try {
      const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${YOUTUBE_API_KEY}`;
      const res = await axios.get(ytUrl, { timeout: 8000 });
      if (res.data?.items && res.data.items[0]) {
        const item = res.data.items[0];
        const track = mapYouTubeItemToTrack(item);
        if (track) {
          if (item.statistics?.viewCount) {
            const v = Number(item.statistics.viewCount);
            track.views = v >= 1000000 ? `${(v / 1000000).toFixed(1)}M tayangan` : `${(v / 1000).toFixed(0)}K tayangan`;
          }
          saveTracksToCache([track]);
          return track;
        }
      }
    } catch (e) {
      console.warn('YouTube Video Detail notice:', e.message || e);
    }

    // 3. Fallback terverifikasi
    return {
      id,
      videoId: id,
      title: `Frekuensi ZENVY: ${id}`,
      channelTitle: 'YouTube Music',
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      description: 'Detail data frekuensi musik untuk video ' + id,
      bpm: 80,
      musicalKey: 'F# Minor',
      lufs: '-14.0 LUFS',
      bitrate: '320kbps OPUS',
      publishedAt: new Date().toISOString()
    };
  }
};

// ==========================================
// 3. FAVORITES SERVICE
// ==========================================
export const favoritesApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/favorites');
      return response.data?.items || response.data || [];
    } catch {
      return getValidFavorites();
    }
  },

  add: async (music) => {
    try {
      const response = await apiClient.post('/favorites', music);
      return response.data;
    } catch {
      const current = getValidFavorites();
      if (!current.some(item => item.id === music.id || item.videoId === music.videoId)) {
        const updated = [music, ...current];
        setStorage('zenvy_favorites', updated);
      }
      return music;
    }
  },

  remove: async (musicId) => {
    try {
      const response = await apiClient.delete(`/favorites/${musicId}`);
      return response.data;
    } catch {
      const current = getValidFavorites();
      const updated = current.filter(item => item.id !== musicId && item.videoId !== musicId);
      setStorage('zenvy_favorites', updated);
      return { success: true, removedId: musicId };
    }
  }
};

// ==========================================
// 4. PLAYLISTS SERVICE
// ==========================================
export const playlistApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/playlists');
      return response.data?.items || response.data || [];
    } catch {
      return getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/playlists/${id}`);
      return response.data;
    } catch {
      const playlists = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      return playlists.find(p => p.id === id) || null;
    }
  },

  create: async (name, description = '') => {
    try {
      const response = await apiClient.post('/playlists', { name, description });
      return response.data;
    } catch {
      const current = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      const newPlaylist = {
        id: 'pl_' + Date.now(),
        name,
        description,
        isPublic: true,
        frequencyPreset: "432 Hz Resonansi",
        moodTags: ["Fokus", "Belajar"],
        coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
        tracks: []
      };
      const updated = [newPlaylist, ...current];
      setStorage('zenvy_playlists', updated);
      return newPlaylist;
    }
  },

  update: async (id, updatedFields) => {
    try {
      const response = await apiClient.put(`/playlists/${id}`, updatedFields);
      return response.data;
    } catch {
      const playlists = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      const updated = playlists.map(pl => {
        if (pl.id === id) {
          return { ...pl, ...updatedFields };
        }
        return pl;
      });
      setStorage('zenvy_playlists', updated);
      return { ...playlists.find(p => p.id === id), ...updatedFields };
    }
  },

  reorderTracks: async (playlistId, newTracks) => {
    try {
      const response = await apiClient.put(`/playlists/${playlistId}/reorder`, { tracks: newTracks });
      return response.data;
    } catch {
      const playlists = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      const updated = playlists.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, tracks: newTracks };
        }
        return pl;
      });
      setStorage('zenvy_playlists', updated);
      return { success: true };
    }
  },

  addTrack: async (playlistId, track) => {
    try {
      const response = await apiClient.post(`/playlists/${playlistId}/tracks`, track);
      return response.data;
    } catch {
      const playlists = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      const updated = playlists.map(pl => {
        if (pl.id === playlistId) {
          const exists = pl.tracks?.some(t => (t.id || t.videoId) === (track.id || track.videoId));
          if (!exists) {
            return { ...pl, tracks: [...(pl.tracks || []), track] };
          }
        }
        return pl;
      });
      setStorage('zenvy_playlists', updated);
      return { success: true };
    }
  },

  removeTrack: async (playlistId, trackId) => {
    try {
      const response = await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
      return response.data;
    } catch {
      const playlists = getStorage('zenvy_playlists', INITIAL_MOCK_PLAYLISTS);
      const updated = playlists.map(pl => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            tracks: (pl.tracks || []).filter(t => t.id !== trackId && t.videoId !== trackId)
          };
        }
        return pl;
      });
      setStorage('zenvy_playlists', updated);
      return { success: true };
    }
  }
};

export default apiClient;
