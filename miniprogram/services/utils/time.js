/**
 * 时间处理工具
 */

const timeUtils = {
  /**
   * 获取相对时间描述
   * @param {String} dateStr 日期字符串
   * @returns {String} 相对时间描述
   */
  getRelativeTime: function(dateStr) {
    if (!dateStr) return '暂无数据';
    
    const now = new Date();
    const date = new Date(dateStr);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) return '日期无效';
    
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `今天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays === 1) {
      return `昨天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays === 2) {
      return `前天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else {
      return `${Math.floor(diffDays / 30)}个月前`;
    }
  },
  
  /**
   * 判断时间是否早于指定时间
   * @param {String} relativeTime 相对时间描述
   * @param {Date} compareDate 比较日期
   * @returns {Boolean} 是否早于指定时间
   */
  isOlderThan: function(relativeTime, compareDate) {
    // 处理特殊情况
    if (relativeTime === '暂无数据' || relativeTime === '日期无效') {
      return true;
    }
    
    const now = new Date();
    
    // 解析相对时间
    if (relativeTime === '刚刚') {
      return false;
    } else if (relativeTime.includes('分钟前')) {
      const minutes = parseInt(relativeTime);
      const date = new Date(now - minutes * 60 * 1000);
      return date < compareDate;
    } else if (relativeTime.includes('今天')) {
      const [_, timeStr] = relativeTime.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date < compareDate;
    } else if (relativeTime.includes('昨天')) {
      const [_, timeStr] = relativeTime.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      date.setHours(hours, minutes, 0, 0);
      return date < compareDate;
    } else if (relativeTime.includes('前天')) {
      const [_, timeStr] = relativeTime.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(now);
      date.setDate(date.getDate() - 2);
      date.setHours(hours, minutes, 0, 0);
      return date < compareDate;
    } else if (relativeTime.includes('天前')) {
      const days = parseInt(relativeTime);
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date < compareDate;
    } else if (relativeTime.includes('周前')) {
      const weeks = parseInt(relativeTime);
      const date = new Date(now);
      date.setDate(date.getDate() - weeks * 7);
      return date < compareDate;
    } else if (relativeTime.includes('个月前')) {
      const months = parseInt(relativeTime);
      const date = new Date(now);
      date.setMonth(date.getMonth() - months);
      return date < compareDate;
    }
    
    return true; // 默认情况下认为是旧数据
  },
  
  /**
   * 比较两个相对时间的先后顺序
   * @param {String} timeA 相对时间A
   * @param {String} timeB 相对时间B
   * @returns {Number} 比较结果：1表示A晚于B，-1表示A早于B，0表示相等
   */
  compareRelativeTimes: function(timeA, timeB) {
    // 处理特殊情况
    if (timeA === '暂无数据' && timeB === '暂无数据') return 0;
    if (timeA === '暂无数据') return -1;
    if (timeB === '暂无数据') return 1;
    
    const now = new Date();
    const dateA = this.relativeTimeToDate(timeA, now);
    const dateB = this.relativeTimeToDate(timeB, now);
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return -1;
    if (!dateB) return 1;
    
    return dateA > dateB ? 1 : (dateA < dateB ? -1 : 0);
  },
  
  /**
   * 将相对时间转换为日期对象
   * @param {String} relativeTime 相对时间描述
   * @param {Date} now 当前时间
   * @returns {Date|null} 日期对象，转换失败返回null
   */
  relativeTimeToDate: function(relativeTime, now = new Date()) {
    try {
      if (relativeTime === '刚刚') {
        return new Date(now);
      } else if (relativeTime.includes('分钟前')) {
        const minutes = parseInt(relativeTime);
        return new Date(now - minutes * 60 * 1000);
      } else if (relativeTime.includes('今天')) {
        const [_, timeStr] = relativeTime.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(now);
        date.setHours(hours, minutes, 0, 0);
        return date;
      } else if (relativeTime.includes('昨天')) {
        const [_, timeStr] = relativeTime.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(now);
        date.setDate(date.getDate() - 1);
        date.setHours(hours, minutes, 0, 0);
        return date;
      } else if (relativeTime.includes('前天')) {
        const [_, timeStr] = relativeTime.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(now);
        date.setDate(date.getDate() - 2);
        date.setHours(hours, minutes, 0, 0);
        return date;
      } else if (relativeTime.includes('天前')) {
        const days = parseInt(relativeTime);
        const date = new Date(now);
        date.setDate(date.getDate() - days);
        return date;
      } else if (relativeTime.includes('周前')) {
        const weeks = parseInt(relativeTime);
        const date = new Date(now);
        date.setDate(date.getDate() - weeks * 7);
        return date;
      } else if (relativeTime.includes('个月前')) {
        const months = parseInt(relativeTime);
        const date = new Date(now);
        date.setMonth(date.getMonth() - months);
        return date;
      }
    } catch (error) {
      console.error('解析相对时间失败:', error);
    }
    
    return null;
  },
  
  /**
   * 格式化日期为YYYY-MM-DD格式
   * @param {Date} date 日期对象
   * @returns {String} 格式化后的日期字符串
   */
  formatDate: function(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  /**
   * 格式化时间为YYYY-MM-DD HH:MM:SS格式
   * @param {Date} date 日期对象
   * @returns {String} 格式化后的时间字符串
   */
  formatDateTime: function(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

module.exports = timeUtils;