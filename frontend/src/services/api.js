import axios from 'axios';
import { INITIAL_MOCK_MUSIC, INITIAL_MOCK_USER, INITIAL_MOCK_PLAYLISTS } from './mockData';

// Konfigurasi Base URL dari Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    try {
      const response = await apiClient.get('/music/search', {
        params: { q: query }
      });
      return response.data?.items || response.data || [];
    } catch (err) {
      const all = getStorage('zenvy_music_catalog', INITIAL_MOCK_MUSIC);
      if (!query.trim()) return all;
      const qLower = query.toLowerCase();
      return all.filter(m => 
        m.title.toLowerCase().includes(qLower) || 
        m.channelTitle.toLowerCase().includes(qLower) ||
        (m.habitat && m.habitat.toLowerCase().includes(qLower)) ||
        (m.musicalKey && m.musicalKey.toLowerCase().includes(qLower))
      );
    }
  },

  getDetail: async (id) => {
    try {
      const response = await apiClient.get(`/music/${id}`);
      return response.data;
    } catch (err) {
      const all = getStorage('zenvy_music_catalog', INITIAL_MOCK_MUSIC);
      const found = all.find(m => m.id === id || m.videoId === id);
      if (found) return found;
      return {
        id,
        videoId: id,
        title: `Frekuensi ZENVY: ${id}`,
        channelTitle: 'Artis YouTube Music',
        description: 'Detail data frekuensi musik untuk video ' + id,
        bpm: 80,
        musicalKey: 'F# Minor',
        lufs: '-14.0 LUFS',
        bitrate: '320kbps OPUS',
        publishedAt: new Date().toISOString()
      };
    }
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
      return getStorage('zenvy_favorites', [INITIAL_MOCK_MUSIC[0], INITIAL_MOCK_MUSIC[1], INITIAL_MOCK_MUSIC[2]]);
    }
  },

  add: async (music) => {
    try {
      const response = await apiClient.post('/favorites', music);
      return response.data;
    } catch {
      const current = getStorage('zenvy_favorites', [INITIAL_MOCK_MUSIC[0], INITIAL_MOCK_MUSIC[1], INITIAL_MOCK_MUSIC[2]]);
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
      const current = getStorage('zenvy_favorites', [INITIAL_MOCK_MUSIC[0], INITIAL_MOCK_MUSIC[1], INITIAL_MOCK_MUSIC[2]]);
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
