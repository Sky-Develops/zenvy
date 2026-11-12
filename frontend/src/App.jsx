import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MusicPlayer from './components/MusicPlayer';
import GlobalSearchModal from './components/GlobalSearchModal';

import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import EditPlaylist from './pages/EditPlaylist';
import CreatePlaylist from './pages/CreatePlaylist';
import MusicDetail from './pages/MusicDetail';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import Login from './pages/Login';
import Register from './pages/Register';
import { Radio } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-[#1C1C1F] text-zenvy-primary flex items-center justify-center shadow-lg">
      <Radio className="w-7 h-7" />
    </div>
    <h2 className="text-2xl font-bold text-white">404: Page Not Found</h2>
    <p className="text-xs text-zenvy-muted max-w-sm">
      The page or track you're looking for doesn't exist or has moved.
    </p>
    <Link
      to="/"
      className="px-5 py-2.5 rounded-xl bg-zenvy-primary text-white text-xs font-bold hover:bg-emerald-400 transition shadow-sm"
    >
      Back to Home
    </Link>
  </div>
);

function AppShell() {
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const { currentTrack, isPlayerOpen } = usePlayer();
  const hasActivePlayer = Boolean(isPlayerOpen && currentTrack);

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
    <div className="flex h-full w-full bg-zenvy-obsidian text-zenvy-text overflow-hidden overscroll-none select-none">
      
      {/* 1. Sidebar Kiri Persisten (Tanpa Paywall/PRO) */}
      <Sidebar onOpenOmnibar={() => setIsOmnibarOpen(true)} />

      {/* Drawer Seluler Responsif */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-zenvy-sidebar border-r border-zenvy-border h-full z-10 overflow-hidden overscroll-none">
            <Sidebar onOpenOmnibar={() => { setIsMobileMenuOpen(false); setIsOmnibarOpen(true); }} />
          </div>
        </div>
      )}

      {/* Kontainer Utama */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden overscroll-none">
        
        {/* 2. Header Atas Persisten */}
        <Header 
          onOpenOmnibar={() => setIsOmnibarOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Tampilan Konten Dinamis */}
        <main 
          className={`flex-1 overflow-y-auto overscroll-contain ${
            isAuthPage 
              ? 'overflow-hidden flex flex-col items-center justify-center' 
              : hasActivePlayer ? 'pb-24' : 'pb-6'
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/playlist/create" element={<CreatePlaylist />} />
            <Route path="/playlists/create" element={<CreatePlaylist />} />
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PlayerProvider>
          <AppShell />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
