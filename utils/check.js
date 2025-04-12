// URL验证和构造
export function validateAndBuildUrl(input) {
    try {
      // 自动补全协议
      const hasProtocol = input.startsWith('http://') || input.startsWith('https://');
      const url = new URL(hasProtocol ? input : `https://${input}`);
      return url.href;
    } catch (e) {
      throw new Error('Invalid domain format');
    }
  }