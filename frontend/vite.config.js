import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function decodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function searchYouTube(query) {
  return new Promise((resolve) => {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const match = data.match(/var ytInitialData = ({.*?});<\/script>/);
          if (!match) return resolve([]);
          const json = JSON.parse(match[1]);
          const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
          if (!contents || !Array.isArray(contents)) return resolve([]);

          const tracks = [];
          for (const section of contents) {
            const items = section?.itemSectionRenderer?.contents || [];
            for (const item of items) {
              const vr = item.videoRenderer;
              if (vr && vr.videoId) {
                const title = decodeHtml(
                  vr.title?.runs?.map(r => r.text).join('') || vr.title?.simpleText || ''
                );
                const channelTitle = decodeHtml(
                  vr.ownerText?.runs?.map(r => r.text).join('') ||
                  vr.longBylineText?.runs?.map(r => r.text).join('') ||
                  'YouTube Music'
                );
                const thumb =
                  vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                  `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`;
                const duration = vr.lengthText?.simpleText || '3:30';

                tracks.push({
                  id: vr.videoId,
                  videoId: vr.videoId,
                  title: title || 'Lagu Tanpa Judul',
                  channelTitle: channelTitle || 'Artis',
                  thumbnailUrl: thumb,
                  duration: duration,
                  description: decodeHtml(
                    vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map(r => r.text).join('') || ''
                  ),
                  bitrate: '320kbps OPUS',
                  habitat: 'Eksplorasi Audio',
                  harmonicMatch: 95
                });
              }
            }
          }
          resolve(tracks);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'youtube-search-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/music/search')) {
            const urlObj = new URL(req.url, 'http://localhost');
            const q = urlObj.searchParams.get('q') || '';
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (!q.trim()) {
              res.end(JSON.stringify([]));
              return;
            }
            try {
              const tracks = await searchYouTube(q);
              res.end(JSON.stringify(tracks));
            } catch (err) {
              res.end(JSON.stringify([]));
            }
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
});

