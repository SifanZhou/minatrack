export interface DeviceInfo {
  deviceId: string;
  name: string;
  type?: string;
  status?: 'connected' | 'disconnected';
  lastConnected?: Date;
}

export interface DeviceInfoResponse extends ApiResponse {
  data: {
    device: DeviceInfo;
  };
}