// 使用新的 API 替代过时的 wx.getSystemInfoSync
const rate = wx.getWindowInfo().windowWidth / 750
export default function(rpx) {
    return rate * rpx
}