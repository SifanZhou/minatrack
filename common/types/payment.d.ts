export interface PaymentProvider {
  type: 'wechat' | 'alipay' | 'other';
  config: {
    appId: string;
    mchId?: string;
    [key: string]: any;
  }
}

export interface DeviceSupport {
  type: 'scale' | 'skin_analyzer' | 'other';
  protocol: 'BLE5' | 'BLE4' | 'other';
  dataFormat: string;
}