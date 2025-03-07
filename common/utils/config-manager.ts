import { SystemConfig } from '../types/config';

const cloud = require('wx-server-sdk');
let db: any;

export class ConfigManager {
  private static instance: ConfigManager;
  private config: SystemConfig | null = null;
  private lastFetch: number = 0;
  private readonly cacheDuration = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    cloud.init();
    db = cloud.database();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async getConfig(): Promise<SystemConfig> {
    if (this.shouldRefreshCache()) {
      await this.refreshConfig();
    }
    return this.config!;
  }

  private shouldRefreshCache(): boolean {
    return !this.config || Date.now() - this.lastFetch > this.cacheDuration;
  }

  private async refreshConfig(): Promise<void> {
    const result = await db.collection('system_config')
      .where({ active: true })
      .limit(1)
      .get();

    if (!result.data.length) {
      throw new Error('系统配置未找到');
    }

    this.config = result.data[0];
    this.lastFetch = Date.now();
  }
}