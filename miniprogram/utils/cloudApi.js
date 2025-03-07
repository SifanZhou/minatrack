// 检查这个文件中是否有直接指定环境ID的代码
// 封装云函数调用
const callFunction = async (name, data) => {
  try {
    const result = await wx.cloud.callFunction({
      name,
      data,
      config: {
        env: 'minatrack-2gn8hvj77e8b6cb0' // 明确指定企业微信环境ID
      }
    });
    return result.result;
  } catch (error) {
    console.error(`调用云函数 ${name} 失败:`, error);
    throw error;
  }
};

// 导出云函数调用方法
module.exports = {
  callFunction
};