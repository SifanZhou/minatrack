interface RequestMetric {
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
}

interface PageMetric {
  pagePath: string;
  loadTime: number;
  renderTime: number;
  totalTime: number;
  timestamp: number;
}

interface PageErrorMetric {
  path: string;
  query: Record<string, string>;
  timestamp: number;
  type: string;
}

interface BluetoothMetric {
  deviceId: string;
  action: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  timestamp: number;
}

interface ResourceMetric {
  type: string;
  url: string;
  loadTime: number;
  timestamp: number;
}

interface Metrics {
  requests: RequestMetric[];
  pages: (PageMetric | PageErrorMetric)[];
  bluetooth: BluetoothMetric[];
  resources: ResourceMetric[];
}

class PerformanceMonitor {
  private metrics: Metrics;
  private readonly MAX_RECORDS: number;
  private appShowTime: number;

  constructor() {
    this.metrics = {
      requests: [],
      pages: [],
      bluetooth: [],
      resources: []
    };
    this.MAX_RECORDS = 100;
    this.appShowTime = 0;
    this.init();
  }

  private init(): void {
    // 监听小程序启动
    wx.onAppShow(() => {
      this.appShowTime = Date.now();
    });

    // 监听页面性能
    if (wx.canIUse('onPageNotFound')) {
      wx.onPageNotFound(this.recordPageError.bind(this));
    }
  }

  // 记录网络请求性能
  recordRequest(url: string, startTime: number, endTime: number, success: boolean): RequestMetric {
    const metrics: RequestMetric = {
      url,
      startTime,
      endTime,
      duration: endTime - startTime,
      success
    };

    this.metrics.requests.push(metrics);
    if (this.metrics.requests.length > this.MAX_RECORDS) {
      this.metrics.requests.shift();
    }

    console.log(`Request: ${url}, Duration: ${metrics.duration}ms, Success: ${success}`);
    return metrics;
  }

  // 记录页面性能
  recordPagePerformance(pagePath: string, loadTime: number, renderTime: number): PageMetric {
    const metrics: PageMetric = {
      pagePath,
      loadTime,
      renderTime,
      totalTime: loadTime + renderTime,
      timestamp: Date.now()
    };

    this.metrics.pages.push(metrics);
    if (this.metrics.pages.length > this.MAX_RECORDS) {
      this.metrics.pages.shift();
    }

    console.log(`Page: ${pagePath}, Load: ${loadTime}ms, Render: ${renderTime}ms`);
    return metrics;
  }

  // 记录页面错误
  recordPageError(data: WechatMiniprogram.OnPageNotFoundCallbackResult): void {
    const metrics: PageErrorMetric = {
      path: data.path,
      query: data.query,
      timestamp: Date.now(),
      type: 'notFound'
    };

    this.metrics.pages.push(metrics);
    console.error(`Page not found: ${data.path}`);
  }

  // 记录蓝牙连接性能
  recordBluetoothPerformance(
    deviceId: string, 
    action: string, 
    startTime: number, 
    endTime: number, 
    success: boolean
  ): BluetoothMetric {
    const metrics: BluetoothMetric = {
      deviceId,
      action,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      timestamp: Date.now()
    };

    this.metrics.bluetooth.push(metrics);
    if (this.metrics.bluetooth.length > this.MAX_RECORDS) {
      this.metrics.bluetooth.shift();
    }

    console.log(`Bluetooth ${action}: ${deviceId}, Duration: ${metrics.duration}ms, Success: ${success}`);
    return metrics;
  }

  // 记录资源加载性能
  recordResourcePerformance(resourceType: string, resourceUrl: string, loadTime: number): ResourceMetric {
    const metrics: ResourceMetric = {
      type: resourceType,
      url: resourceUrl,
      loadTime,
      timestamp: Date.now()
    };

    this.metrics.resources.push(metrics);
    if (this.metrics.resources.length > this.MAX_RECORDS) {
      this.metrics.resources.shift();
    }

    console.log(`Resource: ${resourceType}, URL: ${resourceUrl}, Load time: ${loadTime}ms`);
    return metrics;
  }

  // 获取请求平均响应时间
  getAverageResponseTime(): number {
    if (this.metrics.requests.length === 0) return 0;

    const totalDuration = this.metrics.requests.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / this.metrics.requests.length;
  }

  // 获取请求成功率
  getSuccessRate(): number {
    if (this.metrics.requests.length === 0) return 1;

    const successCount = this.metrics.requests.filter(metric => metric.success).length;
    return successCount / this.metrics.requests.length;
  }

  // 获取页面平均加载时间
  getAveragePageLoadTime(): number {
    const pageMetrics = this.metrics.pages.filter(
      (metric): metric is PageMetric => 'loadTime' in metric
    );
    
    if (pageMetrics.length === 0) return 0;

    const totalLoadTime = pageMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return totalLoadTime / pageMetrics.length;
  }

  // 获取蓝牙连接成功率
  getBluetoothSuccessRate(): number {
    const connectActions = this.metrics.bluetooth.filter(m => m.action === 'connect');
    if (connectActions.length === 0) return 1;

    const successCount = connectActions.filter(m => m.success).length;
    return successCount / connectActions.length;
  }

  // 获取所有性能指标
  getMetrics() {
    return {
      requests: {
        totalRequests: this.metrics.requests.length,
        averageResponseTime: this.getAverageResponseTime(),
        successRate: this.getSuccessRate(),
        recentRequests: this.metrics.requests.slice(-10)
      },
      pages: {
        totalPageViews: this.metrics.pages.length,
        averageLoadTime: this.getAveragePageLoadTime(),
        recentPages: this.metrics.pages.slice(-10)
      },
      bluetooth: {
        totalOperations: this.metrics.bluetooth.length,
        connectSuccessRate: this.getBluetoothSuccessRate(),
        recentOperations: this.metrics.bluetooth.slice(-10)
      },
      resources: {
        totalResources: this.metrics.resources.length,
        recentResources: this.metrics.resources.slice(-10)
      }
    };
  }

  // 清除所有指标
  clearMetrics(): void {
    this.metrics = {
      requests: [],
      pages: [],
      bluetooth: [],
      resources: []
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const monitor = performanceMonitor;