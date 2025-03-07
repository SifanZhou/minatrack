// 应用配置
export const appConfig = {
    // 云环境ID
    cloudEnv: 'dev-123456',
    
    // 是否使用本地模拟数据（不调用云函数）
    useLocalMock: true,
    
    // API基础URL
    apiBaseUrl: 'https://api.minatrack.com',
    
    // 缓存时间（毫秒）
    cacheTime: {
      short: 5 * 60 * 1000, // 5分钟
      medium: 30 * 60 * 1000, // 30分钟
      long: 60 * 60 * 1000, // 1小时
      day: 24 * 60 * 60 * 1000 // 1天
    },
    
    // 日志级别: debug, info, warn, error
    logLevel: 'debug'
  };

// 环境类型定义
export enum Environment {
  DEV = 'development',
  TEST = 'testing',
  PROD = 'production'
}

// 环境配置接口
interface EnvironmentConfig {
  apiBaseUrl: string;
  cloudEnv: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  cacheTime: {
    short: number;
    medium: number;
    long: number;
    day: number;
  };
}

// API 路径配置接口
interface ApiPathConfig {
  USER: {
    LOGIN: string;
    REGISTER: string;
    PROFILE: string;
    BIND_SPECIALIST: string;
    UNBIND_SPECIALIST: string;
    BODYFAT: string;
    BODYFAT_HISTORY: string;
    LATEST_BODYFAT: string;
    MEASUREMENTS: string;
  };
  SPECIALIST: {
    LOGIN: string;
    PROFILE: string;
    CLIENTS: string;
    CLIENT_DETAIL: string;
    INVITE_CODE: string;
    REPORT: string;
    SUBSCRIPTION: string;
    SUBSCRIBE: string;
  };
  DEVICE: {
    INFO: string;
    CONNECT: string;
    DISCONNECT: string;
  };
}

// 应用配置接口
interface AppConfig extends EnvironmentConfig {
  env: Environment;
  isDevEnv: boolean;
  isTestEnv: boolean;
  isProdEnv: boolean;
  apiPath: ApiPathConfig;
}

// 当前环境
const CURRENT_ENV: Environment = Environment.DEV;

// 各环境配置
const config: Record<Environment, EnvironmentConfig> = {
  [Environment.DEV]: {
    apiBaseUrl: 'https://dev-api.minatrack.com',
    cloudEnv: 'cloud1-0gwkl3a2510d877e',
    logLevel: 'debug',
    cacheTime: {
      short: 60,
      medium: 300,
      long: 3600,
      day: 86400
    }
  },
  [Environment.TEST]: {
    apiBaseUrl: 'https://test-api.minatrack.com',
    cloudEnv: 'cloud1-0gwkl3a2510d877e-test',
    logLevel: 'info',
    cacheTime: {
      short: 60,
      medium: 300,
      long: 3600,
      day: 86400
    }
  },
  [Environment.PROD]: {
    apiBaseUrl: 'https://api.minatrack.com',
    cloudEnv: 'cloud1-0gwkl3a2510d877e-prod',
    logLevel: 'error',
    cacheTime: {
      short: 60,
      medium: 300,
      long: 3600,
      day: 86400
    }
  }
};

// API 路径配置
const API_PATH: ApiPathConfig = {
  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
    BIND_SPECIALIST: '/api/user/bind-specialist',
    UNBIND_SPECIALIST: '/api/user/unbind-specialist',
    BODYFAT: '/api/user/bodyfat',
    BODYFAT_HISTORY: '/api/user/bodyfat/history',
    LATEST_BODYFAT: '/api/user/bodyfat/latest',
    MEASUREMENTS: '/api/user/measurements'
  },
  SPECIALIST: {
    LOGIN: '/api/specialist/login',
    PROFILE: '/api/specialist/profile',
    CLIENTS: '/api/specialist/clients',
    CLIENT_DETAIL: '/api/specialist/client',
    INVITE_CODE: '/api/specialist/invite-code',
    REPORT: '/api/specialist/report',
    SUBSCRIPTION: '/api/specialist/subscription',
    SUBSCRIBE: '/api/specialist/subscribe'
  },
  DEVICE: {
    INFO: '/api/device/info',
    CONNECT: '/api/device/connect',
    DISCONNECT: '/api/device/disconnect'
  }
};

// 导出当前环境配置
export const appConfig: AppConfig = {
  ...config[CURRENT_ENV],
  env: CURRENT_ENV,
  isDevEnv: CURRENT_ENV === Environment.DEV,
  isTestEnv: CURRENT_ENV === Environment.TEST,
  isProdEnv: CURRENT_ENV === Environment.PROD,
  apiPath: API_PATH,
  useLocalMock: true  // 添加本地模拟模式
};

// 切换环境的方法（仅在开发环境可用）
export const switchEnv = (env: keyof typeof Environment): boolean => {
  if (appConfig.isDevEnv && Environment[env]) {
    Object.assign(appConfig, config[Environment[env]], { env: Environment[env] });
    console.log(`已切换到${env}环境`);
    return true;
  }
  return false;
};