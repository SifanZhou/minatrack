interface CacheItem<T> {
  data: T;
  expiry: number;
}

export class CacheManager {
  static set<T>(key: string, data: T, expireSeconds: number = 300): void {
    const expiry = Date.now() + expireSeconds * 1000;
    const cacheItem: CacheItem<T> = { data, expiry };
    
    try {
      wx.setStorageSync(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('缓存写入失败:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const value = wx.getStorageSync(key);
      if (!value) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(value);
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiry) {
        this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('缓存读取失败:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      wx.removeStorageSync(key);
    } catch (error) {
      console.error('缓存删除失败:', error);
    }
  }

  static clear(): void {
    try {
      wx.clearStorageSync();
    } catch (error) {
      console.error('缓存清理失败:', error);
    }
  }
}