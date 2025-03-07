import { ErrorResponse } from './error';

export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  lastConnected?: Date;
  userId: string;
}

export interface DeviceConnectParams {
  deviceId: string;
  name: string;
}

export interface DeviceConnectResult extends ApiResponse {
  data: {
    device: Device;
  };
}

export interface DeviceInfo {
  _id: string;
  deviceId: string;
  name: string;
  status: string;
}

export interface DeviceConnectResponse {
  success: boolean;
  device: DeviceInfo;
}

export interface DeviceDataResponse {
  success: boolean;
  measurement: {
    deviceId: string;
    data: Record<string, any>;
  };
}

export type DeviceResponse = ErrorResponse | DeviceConnectResponse;
export type DeviceDataResult = ErrorResponse | DeviceDataResponse;