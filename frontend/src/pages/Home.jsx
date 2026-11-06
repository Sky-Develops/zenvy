import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { musicApi, favoritesApi } from '../services/api';
import { SONIC_HABITATS } from '../services/mockData';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [modalMusic, setModalMusic] = useState(null);

  const { playTrack } = usePlayer();
  const { user } = useAuth();

  // Sambutan waktu dinamis bahasa Indonesia
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 11) return 'Selamat pagi';
    if (hr >= 11 && hr < 15) return 'Selamat siang';
    if (hr >= 15 && hr < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tracks, favs] = await Promise.all([
        musicApi.search(''),
        favoritesApi.getAll().catch(() => [])
      ]);
      setMusicList(tracks);
      setFavoriteIds(new Set(favs.map(f => f.videoId || f.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (track) => {
    const trackId = track.videoId || track.id;
    const isFav = favoriteIds.has(trackId);
    try {
      if (isFav) {
        await favoritesApi.remove(trackId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
      } else {
        await favoritesApi.add(track);
        setFavoriteIds(prev => new Set(prev).add(trackId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const featuredTrack = musicList[0];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      
      {/* Sambutan Waktu Dinamis & Status Sinkronisasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zenvy-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}{user?.username ? `, ${user.username}` : ', Elena'}
          </h1>
          <p className="text-xs sm:text-sm text-zenvy-muted mt-0.5">
            Sinkronisasi Audio Lossless Aktif • Penyelarasan Frekuensi 432 Hz Siap
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenvy-card border border-zenvy-border text-xs text-zinc-300 font-medium">

            98.4 kHz Langsung
          </span>
        </div>
      </div>

      {/* Frekuensi Unggulan (Hero Banner) */}
      {featuredTrack && (
        <section className="relative rounded-2xl bg-gradient-to-r from-zenvy-cardElevated via-zenvy-card to-zenvy-obsidian border border-zenvy-border overflow-hidden shadow-2xl p-6 sm:p-8">


          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Info Kiri */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-zenvy-violet text-white text-[10px] font-bold uppercase tracking-wider">
                  Frekuensi Unggulan
                </span>
                <span className="px-2.5 py-1 rounded bg-zenvy-card text-zinc-300 border border-zenvy-border text-[10px] font-mono font-semibold">
                  320kbps OPUS
                </span>
                {featuredTrack.musicalKey && (
                  <span className="px-2 py-0.5 rounded bg-zenvy-obsidian text-zinc-300 border border-zenvy-border text-[10px] font-mono">
                    {featuredTrack.musicalKey} • {featuredTrack.bpm} BPM
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {featuredTrack.title}
              </h2>

              <p className="text-xs sm:text-sm text-zenvy-muted max-w-2xl line-clamp-2 leading-relaxed">
                {featuredTrack.description}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => playTrack(featuredTrack)}
                  className="px-6 py-2.5 rounded-lg bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-105 transition shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current text-black" />
                  <span>Putar Sekarang</span>
                </button>

                <Link
                  to={`/music/${featuredTrack.videoId || featuredTrack.id}`}
                  className="px-4 py-2.5 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border text-xs font-semibold text-zinc-300 hover:text-white transition"
                >
                  Lihat Profil Suara
                </Link>
              </div>
            </div>

            {/* Artwork Kanan */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border border-zenvy-border shadow-2xl group">
                <img
                  src={featuredTrack.thumbnailUrl}
                  alt={featuredTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lanjutkan Mendengarkan / Suasana Suara Cepat */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-zenvy-violetSoft" />
            <span>Suasana Suara & Lingkungan</span>
          </h3>
          <Link to="/explore" className="text-xs font-semibold text-zenvy-violetSoft hover:underline flex items-center gap-1">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {SONIC_HABITATS.map((hab) => (
            <Link
              key={hab.id}
              to={`/explore?habitat=${encodeURIComponent(hab.name)}`}
              className="p-4 rounded-xl bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border transition group"
            >
              <p className="text-[10px] font-bold text-zinc-400 uppercase">{hab.activeListeners}</p>
              <h4 className="text-sm font-bold text-white mt-1 group-hover:text-zenvy-violetSoft transition truncate">
                {hab.name}
              </h4>
              <p className="text-[11px] text-zenvy-muted truncate mt-0.5">{hab.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Rekomendasi Untuk Anda (Tingkat Kecocokan 88% - 98%) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Rekomendasi Untuk Anda (Kecocokan 88%–98%)</span>
            </h3>
            <p className="text-xs text-zenvy-muted">Katalog audio dinamis beresolusi tinggi tanpa batasan paywall</p>
          </div>
          <span className="text-xs text-zinc-500">{musicList.length} trek</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Menyelaraskan frekuensi katalog..." size="lg" />
        ) : musicList.length === 0 ? (
          <EmptyState
            title="Katalog Sedang Dimuat"
            description="Tidak dapat memuat frekuensi saat ini. Silakan periksa koneksi internet."
            actionLabel="Muat Ulang"
            onAction={fetchInitialData}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {musicList.map((music) => {
              const trackId = music.videoId || music.id;
              return (
                <MusicCard
                  key={trackId}
                  music={music}
                  isFavorite={favoriteIds.has(trackId)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(t) => setModalMusic(t)}
                />
              );
            })}
          </div>
        )}
      </section>

      <AddToPlaylistModal
        isOpen={!!modalMusic}
        music={modalMusic}
        onClose={() => setModalMusic(null)}
      />
    </div>
  );
};

export default Home;
