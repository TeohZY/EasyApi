import axios from 'axios';
import { load } from 'cheerio';
import { URL } from 'url';
import {cache} from '../config/cache.js';

/**
 * 获取网站的 favicon 图标链接
 * @param {string} siteUrl - 网站URL
 * @returns {Promise<string>} - favicon 图标链接
 */
export async function getFavicon(siteUrl) {
  try {

    // 检查缓存中是否已有该网站的 favicon
    const cachedFavicon = cache.get(siteUrl);
    if (cachedFavicon) {
      return cachedFavicon;
    }

    // 首先尝试直接获取 /favicon.ico
    const baseUrl = new URL(siteUrl).origin;
    const faviconUrl = `${baseUrl}/favicon.ico`;

    // 检查 /favicon.ico 是否存在
    try {
      const response = await axios.head(faviconUrl, { timeout: 3000 });
      if (response.status === 200) {
        return faviconUrl;
      }
    } catch (e) {
      // 如果直接访问/favicon.ico失败，继续下面的方法
    }

    // 如果直接获取失败，解析HTML查找favicon
    const response = await axios.get(siteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = load(response.data);
    let iconUrl = null;

    // 查找各种可能的favicon链接
    $('link[rel*="icon"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !iconUrl) {
        iconUrl = new URL(href, baseUrl).href;
      }
    });
    // 将结果存入缓存
    cache.set(siteUrl, faviconUrl);
    // 如果没有找到，尝试默认的/favicon.ico
    return iconUrl || faviconUrl;
  } catch (error) {
    console.error(`Error fetching favicon for ${siteUrl}:`, error.message);
    throw new Error('Failed to fetch favicon');
  }
}


export async function getFaviconStream(siteUrl) {
  try {
    // 1. 检查缓存（缓存图片Buffer或Stream）
    const cached = cache.get(siteUrl);
    if (cached) {
      return { stream: cached.stream, contentType: cached.contentType };
    }

    // 2. 获取favicon实际URL（原逻辑）
    const baseUrl = new URL(siteUrl).origin;
    let faviconUrl = `${baseUrl}/favicon.ico`;
    
    // 3. 验证/favicon.ico是否存在
    try {
      await axios.head(faviconUrl, { timeout: 3000 });
    } catch {
      // 如果不存在，解析HTML查找其他favicon
      const htmlResponse = await axios.get(siteUrl, { timeout: 5000 });
      const $ = load(htmlResponse.data);
      
      const iconEl = $('link[rel*="icon"]').first();
      if (iconEl.length) {
        faviconUrl = new URL(iconEl.attr('href'), baseUrl).href;
      }
    }

    // 4. 获取图片流
    const response = await axios.get(faviconUrl, {
      responseType: 'stream', // 关键点
      timeout: 3000
    });

    // 5. 缓存可复用的数据（非流）
    cache.set(siteUrl, {
      url: faviconUrl,
      contentType: response.headers['content-type']
    });

    return {
      stream: response.data,
      contentType: response.headers['content-type'] || 'image/x-icon'
    };
  } catch (error) {
    console.error(`Favicon fetch failed for ${siteUrl}:`, error);
    throw new Error('Failed to retrieve favicon');
  }
}