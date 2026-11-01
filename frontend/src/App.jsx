import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MusicPlayer from './components/MusicPlayer';
import GlobalSearchModal from './components/GlobalSearchModal';

import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import EditPlaylist from './pages/EditPlaylist';
import MusicDetail from './pages/MusicDetail';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import Login from './pages/Login';
import Register from './pages/Register';
import { Radio } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
    <div className="w-14 h-14 rounded-xl bg-zenvy-card text-zenvy-violetSoft flex items-center justify-center border border-zenvy-border">
      <Radio className="w-7 h-7" />
    </div>
    <h2 className="text-2xl font-bold text-white">404 — Frekuensi Terputus</h2>
    <p className="text-xs text-zenvy-muted max-w-sm">
      Kanal atau frekuensi yang Anda tuju sedang tidak aktif atau telah berpindah alamat.
    </p>
    <Link
      to="/"
      className="px-5 py-2.5 rounded-lg bg-zenvy-violet text-white text-xs font-semibold hover:bg-purple-700 transition"
    >
      Kembali ke Beranda
    </Link>
  </div>
);

function AppShell() {
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pintasan Keyboard Global: Ctrl+K / Cmd+K untuk Omnibar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmnibarOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOmnibarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-zenvy-obsidian text-zenvy-text overflow-hidden select-none">
      
      {/* 1. Sidebar Kiri Persisten (Tanpa Paywall/PRO) */}
      <Sidebar onOpenOmnibar={() => setIsOmnibarOpen(true)} />

      {/* Drawer Seluler Responsif */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-zenvy-sidebar border-r border-zenvy-border h-full z-10">
            <Sidebar onOpenOmnibar={() => { setIsMobileMenuOpen(false); setIsOmnibarOpen(true); }} />
          </div>
        </div>
      )}

      {/* Kontainer Utama */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* 2. Header Atas Persisten */}
        <Header 
          onOpenOmnibar={() => setIsOmnibarOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Tampilan Konten Dinamis */}
        <main className="flex-1 overflow-y-auto pb-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/playlist/:id/edit" element={<EditPlaylist />} />
            <Route path="/playlists/:id/edit" element={<EditPlaylist />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/library" element={<Playlists />} />
            <Route path="/music/:id" element={<MusicDetail />} />
            <Route path="/track/:id" element={<MusicDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* 3. Pemutar Musik Persisten 3-Zona */}
        <MusicPlayer />
      </div>

      {/* 4. Omnibar Cepat Global (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isOmnibarOpen}
        onClose={() => setIsOmnibarOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppShell />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
