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
