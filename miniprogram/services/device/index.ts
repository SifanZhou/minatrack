import { BaseService } from '../base/base';

interface DeviceInfo {
  deviceId: string;
  name: string;
  [key: string]: any;
}

export class DeviceService extends BaseService {
  async connect(deviceId: string): Promise<any> {
    return this.callFunction('device', {
      action: 'connect',
      deviceId
    });
  }

  async disconnect(deviceId: string): Promise<any> {
    return this.callFunction('device', {
      action: 'disconnect',
      deviceId
    });
  }

  async syncData(deviceId: string, data: ArrayBuffer): Promise<any> {
    // 将ArrayBuffer转为Base64字符串传输
    const base64Data = wx.arrayBufferToBase64(data);
    
    return this.callFunction('device', {
      action: 'data',
      deviceId,
      data: base64Data
    });
  }

  async getDeviceList(): Promise<any> {
    return this.callFunction('device', {
      action: 'list'
    });
  }
}

export const deviceService = new DeviceService();