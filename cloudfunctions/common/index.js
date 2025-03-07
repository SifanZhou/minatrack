const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const { action, params } = event;

  switch (action) {
    case 'generateQRCode':
      return await generateQRCode(params);
    default:
      return {
        success: false,
        error: '未知的操作类型'
      };
  }
};

async function generateQRCode({ scene, page }) {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene,
      page,
      check_path: true,
      env_version: 'release'
    });

    // 上传二维码到云存储
    const upload = await cloud.uploadFile({
      cloudPath: `qrcodes/${Date.now()}.jpg`,
      fileContent: result.buffer
    });

    return {
      success: true,
      fileID: upload.fileID
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '生成二维码失败'
    };
  }
}