import axios from 'axios';
import { config } from '../config';
import type { WechatLoginResult } from '../types';

export const wechatService = {
  async code2Session(code: string): Promise<WechatLoginResult> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const { data } = await axios.get(url, {
      params: {
        appid: config.wechat.appId,
        secret: config.wechat.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    if (data.errcode) {
      throw new Error(data.errmsg);
    }
    
    return data;
  }
};