import { Router } from 'express';
const router = Router();
import { getFavicon } from '../services/faviconServices.js';

/**
 * GET /favicon?url=https://example.com
 * 获取网站的favicon图标
 */
router.get('/favicon', async (req, res) => {
  try {
    const siteUrl = req.query.url;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // 验证URL格式
    try {
      new URL(siteUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const faviconUrl = await getFavicon(siteUrl);
    res.json(faviconUrl);
  } catch (error) {
    console.error('Error in favicon route:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
