import * as crypto from 'crypto';

export class DataSecurity {
  // 敏感数据加密
  static encryptSensitiveData(data: any): string {
    const algorithm = 'aes-256-gcm';
    // 确保加密密钥存在且转换为Buffer
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('加密密钥未设置');
    }
    // 使用Buffer.from将密钥字符串转换为Buffer
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      tag: cipher.getAuthTag().toString('hex')
    });
  }
}