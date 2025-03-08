const api = require('../../../services/api');

Page({
  data: {
    qrCodeUrl: '',
    inviteCode: '',
    lastUpdateTime: null,
    statusBarHeight: 20,
    isLoading: false
  },
  
  onLoad: function() {
    try {
      // 使用新的API替代已弃用的wx.getSystemInfoSync
      const systemInfo = wx.getWindowInfo();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
      // 兼容处理，使用默认值
      this.setData({
        statusBarHeight: 20
      });
    }
  },

  // 生成二维码和邀请码
  async generateQRCode() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '生成中...' });
    
    try {
      // 生成随机邀请码（6位数字）
      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 使用小程序自带的接口生成二维码
      const qrCodeUrl = await this.createQRCode(`https://minatrack.com/invite?code=${inviteCode}`);
      
      const currentTime = new Date().toISOString();
      
      // 保存到本地存储
      wx.setStorageSync('specialistQRCode', qrCodeUrl);
      wx.setStorageSync('specialistInviteCode', inviteCode);
      wx.setStorageSync('qrCodeLastUpdateTime', currentTime);
      
      this.setData({
        qrCodeUrl,
        inviteCode,
        lastUpdateTime: currentTime,
        isLoading: false
      });

      wx.hideLoading();
      
      // 可以在这里调用后端API保存邀请码与专家的关联关系
      this.saveInviteCodeToBackend(inviteCode);
    } catch (error) {
      console.error('生成二维码失败:', error);
      this.setData({ isLoading: false });
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    }
  },
  
  // 使用canvas在本地生成二维码
  createQRCode(content) {
    return new Promise((resolve, reject) => {
      try {
        // 引入QR码生成库
        const QRCode = require('../../../utils/weapp-qrcode.js');
        
        // 获取系统信息以确定合适的二维码大小
        const systemInfo = wx.getWindowInfo();
        const qrcodeWidth = 200;
        
        // 创建QR码实例
        const qrcode = new QRCode('qrcode-canvas', {
          usingIn: this,  // 在组件或页面中使用时需要指定this
          text: content,
          width: qrcodeWidth,
          height: qrcodeWidth,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
        
        // 延迟一下确保二维码已经绘制完成
        setTimeout(() => {
          // 将canvas转为图片
          wx.canvasToTempFilePath({
            canvasId: 'qrcode-canvas',
            success: (res) => {
              resolve(res.tempFilePath);
            },
            fail: (err) => {
              console.error('生成二维码图片失败:', err);
              reject(err);
            }
          }, this);
        }, 500);
      } catch (error) {
        console.error('创建二维码失败:', error);
        reject(error);
      }
    });
  },
  
  // 保存邀请码到后端
  async saveInviteCodeToBackend(inviteCode) {
    try {
      // 这里可以调用API将邀请码与当前专家关联
      // 例如：
      // await api.saveSpecialistInviteCode(inviteCode);
      console.log('邀请码已保存:', inviteCode);
    } catch (error) {
      console.error('保存邀请码失败:', error);
    }
  },

  // 刷新二维码
  refreshQRCode() {
    if (this.data.isLoading) return;
    
    wx.showLoading({
      title: '更新中...',
    });
    
    this.generateQRCode();
  },

  // 保存二维码到相册
  saveToAlbum() {
    if (!this.data.qrCodeUrl) {
      wx.showToast({
        title: '二维码不存在',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    // 直接保存本地临时文件到相册
    wx.saveImageToPhotosAlbum({
      filePath: this.data.qrCodeUrl,
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存到相册失败:', err);
        // 如果是因为用户拒绝授权导致的失败
        if (err.errMsg.indexOf('auth deny') >= 0 || err.errMsg.indexOf('authorize') >= 0) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    console.log('设置结果:', settingRes);
                  }
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 分享功能
  onShareAppMessage() {
    const fullInviteCode = wx.getStorageSync('specialistInviteCode') || this.data.inviteCode;
    
    return {
      title: '扫描二维码，绑定健康管理师',
      path: `/pages/user/binding/invite?inviteCode=${fullInviteCode}`,
      imageUrl: this.data.qrCodeUrl
    };
  },

  handleBack() {
    wx.navigateBack();
  }
});