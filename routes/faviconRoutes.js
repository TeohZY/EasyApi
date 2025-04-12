import { Router } from 'express';
const router = Router();
import { getFavicon,getFaviconStream } from '../services/faviconServices.js';
import { validateAndBuildUrl } from '../utils/check.js';

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

router.get('/favicon/:domain.png', async (req, res) => {
  try {
    const domain = req.params.domain;
    if (!domain) return res.status(400).send('Missing domain');

    // 验证并构造合法URL
    const siteUrl = validateAndBuildUrl(domain);
    
    // 获取图片流
    const { stream, contentType } = await getFaviconStream(siteUrl);
    
    // 设置响应头
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Content-Disposition': `inline; filename="${domain}.png"` // 强制浏览器作为图片显示
    });
    
    // 流式传输
    stream.pipe(res);
  } catch (error) {
    console.error(`[Favicon] Error for ${req.params.domain}:`, error);
    res.status(404).send();
  }
});

export default router;
