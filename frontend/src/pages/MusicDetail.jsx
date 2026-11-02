import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  Share2, 
  Check, 
  AlertCircle, 
  Activity, 
  Sparkles, 
  Play
} from 'lucide-react';
import { musicApi, favoritesApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const MusicDetail = () => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [similarTracks, setSimilarTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    setPlayerError(false);
    try {
      const data = await musicApi.getDetail(id);
      setTrack(data);

      const [favs, allList] = await Promise.all([
        favoritesApi.getAll().catch(() => []),
        musicApi.search('')
      ]);

      const trackId = data.videoId || data.id || id;
      setIsFavorite(favs.some(f => (f.videoId || f.id) === trackId));
      setSimilarTracks(allList.filter(item => (item.videoId || item.id) !== trackId));
    } catch (err) {
      setError('Gagal memuat informasi frekuensi lagu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!track) return;
    const trackId = track.videoId || track.id || id;
    try {
      if (isFavorite) {
        await favoritesApi.remove(trackId);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(track);
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Mendekode telemetri DNA musikal..." size="lg" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Frekuensi Tidak Ditemukan</h2>
        <p className="text-sm text-zenvy-muted">{error || 'Trek ini sedang tidak tersedia.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zenvy-violet text-white text-xs font-semibold hover:bg-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const trackId = track.videoId || track.id || id;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      
      {/* Navigasi Atas */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zenvy-muted hover:text-white px-3 py-1.5 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Penemuan</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zenvy-card border border-zenvy-border text-zinc-300 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-zinc-300" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Disalin' : 'Bagikan'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner Resolusi Tinggi */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zenvy-card via-zenvy-cardElevated to-zenvy-obsidian border border-zenvy-border flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden flex-shrink-0 border border-zenvy-border shadow-2xl bg-black">
          <img
            src={track.thumbnailUrl || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-zenvy-violet text-white text-[10px] font-bold uppercase tracking-wider">
              {track.habitat || 'Suasana Suara'}
            </span>
            <span className="px-2 py-0.5 rounded bg-zenvy-card text-zinc-300 border border-zenvy-border text-[10px] font-mono font-semibold">
              320kbps OPUS
            </span>
            {track.momentum && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zenvy-border text-[10px] font-mono">
                {track.momentum}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {track.title}
          </h1>

          <p className="text-sm text-zenvy-muted font-medium">
            Dikurasi oleh <span className="text-white font-semibold">{track.channelTitle || 'Artis YouTube'}</span>
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playTrack(track)}
              className="px-6 py-2.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg"
            >
              <Play className="w-4 h-4 fill-current text-black" />
              <span>Putar Trek</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                isFavorite
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-zenvy-card border-zenvy-border text-zinc-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
              <span>{isFavorite ? 'Tersimpan di Favorit' : 'Simpan Favorit'}</span>
            </button>

            <button
              onClick={() => setShowPlaylistModal(true)}
              className="px-4 py-2.5 rounded-lg bg-zenvy-card hover:bg-zenvy-cardElevated border border-zenvy-border text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Utama: Player IFrame YouTube + Panel DNA Musikal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri 8: Player Integrasi IFrame YouTube */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zenvy-border shadow-2xl">
            <iframe
              id="youtube-detail-player"
              title={track.title}
              src={`https://www.youtube-nocookie.com/embed/${trackId}?autoplay=1&enablejsapi=1`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setPlayerError(true)}
            />
          </div>

          {playerError && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Catatan pemutaran: Jika video dibatasi hak cipta oleh YouTube, aliran telemetri audio tetap berjalan normal.</span>
            </div>
          )}

          {/* Sinopsis Trek & Konteks Suasana */}
          <div className="bg-zenvy-card rounded-xl p-5 border border-zenvy-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zenvy-violetSoft">
              Sinopsis Trek & Konteks Suasana
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {track.description || 'Aliran audio frekuensi terkurasi untuk mendampingi sesi produktivitas dan relaksasi.'}
            </p>
          </div>
        </div>

        {/* Kolom Kanan 4: Data DNA Musikal & Rekomendasi Frekuensi Serupa */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Panel DNA Musikal */}
          <div className="bg-zenvy-card rounded-xl p-5 border border-zenvy-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zenvy-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Data DNA Musikal Trek</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono font-semibold">98.4 kHz Langsung</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zenvy-obsidian border border-zenvy-border">
                <span className="text-[10px] text-zenvy-muted uppercase font-bold">Tempo (BPM)</span>
                <p className="text-base font-extrabold text-white font-mono mt-0.5">
                  {track.bpm || 80}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zenvy-obsidian border border-zenvy-border">
                <span className="text-[10px] text-zenvy-muted uppercase font-bold">Tangga Nada Musik</span>
                <p className="text-base font-extrabold text-zenvy-violetSoft font-mono mt-0.5">
                  {track.musicalKey || 'F# Minor'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zenvy-obsidian border border-zenvy-border">
                <span className="text-[10px] text-zenvy-muted uppercase font-bold">Rentang Dinamis</span>
                <p className="text-sm font-bold text-zinc-200 font-mono mt-0.5">
                  {track.lufs || '-14.0 LUFS'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zenvy-obsidian border border-zenvy-border">
                <span className="text-[10px] text-zenvy-muted uppercase font-bold">Codec Audio</span>
                <p className="text-sm font-bold text-zinc-300 font-mono mt-0.5">
                  320k OPUS
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-zinc-400 border-t border-zenvy-border/60 space-y-1">
              <p><span className="text-zinc-500">Tempat Mastering:</span> {track.masterStudio || 'ZENVY Acoustic Labs'}</p>
              <p><span className="text-zinc-500">Mesin Telemetri:</span> YouTube Lossless IFrame JS</p>
            </div>
          </div>

          {/* Rekomendasi Frekuensi Serupa (Penyelarasan Harmonik 87%–99%) */}
          <div className="bg-zenvy-card rounded-xl p-5 border border-zenvy-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-zenvy-violetSoft" />
              <span>Rekomendasi Frekuensi Serupa (87–99%)</span>
            </h3>

            <div className="space-y-2">
              {similarTracks.slice(0, 3).map((sim) => {
                const simId = sim.videoId || sim.id;
                return (
                  <div
                    key={simId}
                    onClick={() => playTrack(sim)}
                    className="p-2.5 rounded-lg bg-zenvy-obsidian hover:bg-zenvy-cardElevated border border-zenvy-border flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={sim.thumbnailUrl}
                        alt={sim.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white group-hover:text-zenvy-violetSoft truncate">
                          {sim.title}
                        </h4>
                        <p className="text-[10px] text-zenvy-muted truncate">{sim.channelTitle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zenvy-card text-zinc-300 border border-zenvy-border whitespace-nowrap">
                      {sim.harmonicMatch || 94}% cocok
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        music={track}
        onClose={() => setShowPlaylistModal(false)}
      />
    </div>
  );
};

export default MusicDetail;
