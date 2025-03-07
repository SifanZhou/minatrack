// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();

export * from './user';
export * from './device';
export * from './system';
export * from './specialist';