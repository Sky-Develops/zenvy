const express = require('express');
const https = require('https');
const router = express.Router();

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

// GET /api/music/search?q=...
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(200).json([]);
  }

  try {
    const tracks = await searchYouTube(query);
    return res.status(200).json(tracks);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(200).json([]);
  }
});

module.exports = router;
