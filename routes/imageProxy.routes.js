import express from 'express';
import axios from 'axios';

export default function createImageProxyRoutes() {
  const router = express.Router();

  // Limit which hosts can be proxied for safety
  const allowedHosts = new Set([
    'i.pinimg.com',
    'images.unsplash.com',
    'cdn.pixabay.com',
  ]);

  router.get('/image-proxy', async (req, res) => {
    const { url } = req.query;
    try {
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url query parameter' });
      }

      const parsed = new URL(url);
      if (!allowedHosts.has(parsed.host)) {
        return res.status(400).json({ error: 'Host not allowed' });
      }

      const upstream = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'CentralClubeImageProxy/1.0',
          'Accept': 'image/*,*/*;q=0.8',
        },
      });

      const contentType = upstream.headers['content-type'] || 'image/jpeg';
      res.set('Content-Type', contentType);
      // Global CORS is applied; explicit header is optional
      // res.set('Access-Control-Allow-Origin', '*');
      res.send(Buffer.from(upstream.data));
    } catch (err) {
      console.error('Image proxy error:', err?.message || err);
      res.status(502).json({ error: 'Failed to fetch image' });
    }
  });

  return router;
}