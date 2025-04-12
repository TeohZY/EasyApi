import NodeCache from 'node-cache';

// 从环境变量获取 TTL（默认 3600 秒 = 1 小时）
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600;

export const cache = new NodeCache({
  stdTTL: CACHE_TTL,       // 缓存默认存活时间
  checkperiod: CACHE_TTL / 2,  // 自动检查过期间隔（优化性能）
});
