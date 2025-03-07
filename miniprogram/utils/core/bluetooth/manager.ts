import { performanceMonitor } from '../../performance/monitor';
import { logger } from '../logger';

interface BluetoothDevice {
  deviceId: string;
  name?: string;
  RSSI?: number;
  advertisData?: ArrayBuffer;
  advertisServiceUUIDs?: string[];
  localName?: string;
  serviceData?: Record<string, ArrayBuffer>;
}

type BluetoothEventType = 'discover' | 'connect' | 'disconnect' | 'receive';
type BluetoothEventCallback = (data: any) => void;

export class BluetoothManager {
  private isInitialized: boolean;
  private isScanning: boolean;
  private connectedDeviceId: string;
  private devices: BluetoothDevice[];
  private listeners: Record<BluetoothEventType, BluetoothEventCallback[]>;

  constructor() {
    this.isInitialized = false;
    this.isScanning = false;
    this.connectedDeviceId = '';
    this.devices = [];
    this.listeners = {
      discover: [],
      connect: [],
      disconnect: [],
      receive: []
    };
  }
  
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    const startTime = Date.now();
    try {
      await wx.openBluetoothAdapter();
      this.isInitialized = true;
      
      // 记录蓝牙初始化性能
      performanceMonitor.recordBluetoothPerformance(
        'adapter', 
        'init', 
        startTime, 
        Date.now(), 
        true
      );
      
      return true;
    } catch (error) {
      logger.error('初始化蓝牙适配器失败:', error);
      
      // 记录蓝牙初始化失败
      performanceMonitor.recordBluetoothPerformance(
        'adapter', 
        'init', 
        startTime, 
        Date.now(), 
        false
      );
      
      return false;
    }
  }
  
  async startScan(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return false;
    }
    
    if (this.isScanning) return true;
    
    const startTime = Date.now();
    try {
      await wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false
      });
      
      this.isScanning = true;
      
      // 记录蓝牙扫描性能
      performanceMonitor.recordBluetoothPerformance(
        'adapter', 
        'startScan', 
        startTime, 
        Date.now(), 
        true
      );
      
      // 监听设备发现事件
      wx.onBluetoothDeviceFound((res) => {
        const newDevices = res.devices.filter(device => {
          // 过滤已存在的设备
          return !this.devices.some(d => d.deviceId === device.deviceId);
        });
        
        if (newDevices.length > 0) {
          this.devices = [...this.devices, ...newDevices];
          this.notifyListeners('discover', newDevices);
        }
      });
      
      return true;
    } catch (error) {
      logger.error('开始扫描蓝牙设备失败:', error);
      
      // 记录蓝牙扫描失败
      performanceMonitor.recordBluetoothPerformance(
        'adapter', 
        'startScan', 
        startTime, 
        Date.now(), 
        false
      );
      
      return false;
    }
  }
  
  async stopScan(): Promise<boolean> {
    if (!this.isScanning) return true;
    
    try {
      await wx.stopBluetoothDevicesDiscovery();
      this.isScanning = false;
      return true;
    } catch (error) {
      logger.error('停止扫描蓝牙设备失败:', error);
      return false;
    }
  }
  
  async connect(deviceId: string): Promise<boolean> {
    try {
      await wx.createBLEConnection({
        deviceId
      });
      
      this.connectedDeviceId = deviceId;
      this.notifyListeners('connect', { deviceId });
      
      // 监听断开连接事件
      wx.onBLEConnectionStateChange((res) => {
        if (!res.connected && res.deviceId === this.connectedDeviceId) {
          this.connectedDeviceId = '';
          this.notifyListeners('disconnect', { deviceId: res.deviceId });
        }
      });
      
      return true;
    } catch (error) {
      logger.error('连接蓝牙设备失败:', error);
      return false;
    }
  }
  
  async disconnect(): Promise<boolean> {
    if (!this.connectedDeviceId) return true;
    
    try {
      await wx.closeBLEConnection({
        deviceId: this.connectedDeviceId
      });
      
      const deviceId = this.connectedDeviceId;
      this.connectedDeviceId = '';
      this.notifyListeners('disconnect', { deviceId });
      
      return true;
    } catch (error) {
      logger.error('断开蓝牙设备连接失败:', error);
      return false;
    }
  }
  
  on(event: BluetoothEventType, callback: BluetoothEventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  off(event: BluetoothEventType, callback: BluetoothEventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  private notifyListeners(event: BluetoothEventType, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`执行蓝牙事件监听器失败 (${event}):`, error);
        }
      });
    }
  }
}

export const bluetoothManager = new BluetoothManager();