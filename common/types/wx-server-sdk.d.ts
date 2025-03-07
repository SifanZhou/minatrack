declare module 'wx-server-sdk' {
  export namespace WechatMiniprogram {
    export interface Cloud {
      CallFunctionParam: any;
    }
  }

  export interface CallFunctionResult {
    result: any;
    errMsg?: string;
  }

  export interface CallFunctionParam {
    name: string;
    data?: any;
  }

  export function init(): void;
  export function getWXContext(): { OPENID: string; UNIONID?: string };
  export function database(): any;
  export function callFunction(param: CallFunctionParam): Promise<CallFunctionResult>;
}