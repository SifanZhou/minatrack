/**
 * 状态计算工具
 */

const statusUtils = {
  /**
   * 计算客户状态
   * @param {Object} userData 用户数据
   * @returns {String} 状态：normal, warning, danger
   */
  calculateClientStatus: function(userData) {
    if (!userData || !userData.measurements || !userData.measurements.length) {
      return 'normal';
    }
    
    // 获取最近的测量数据
    const recentMeasurements = [...userData.measurements]
      .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))
      .slice(0, 2);
    
    // 如果只有一条记录，检查是否异常值
    if (recentMeasurements.length === 1) {
      const measurement = recentMeasurements[0];
      
      // 检查体重是否在正常范围
      if (this.isAbnormalWeight(measurement.weight, userData)) {
        return 'warning';
      }
      
      // 检查体脂是否在正常范围
      if (this.isAbnormalBodyFat(measurement.bodyFat, userData)) {
        return 'danger';
      }
      
      return 'normal';
    }
    
    // 如果有多条记录，检查变化趋势
    const [latest, previous] = recentMeasurements;
    
    // 计算变化率
    const weightChange = latest.weight - previous.weight;
    const weightChangeRate = weightChange / previous.weight;
    
    // 体脂变化
    const fatChange = latest.bodyFat - previous.bodyFat;
    
    // 危险信号：体重快速增加或减少
    if (Math.abs(weightChangeRate) > 0.03 || Math.abs(fatChange) > 3) {
      return 'danger';
    }
    
    // 警告信号：体重轻微异常变化
    if (Math.abs(weightChangeRate) > 0.015 || Math.abs(fatChange) > 1.5) {
      return 'warning';
    }
    
    return 'normal';
  },
  
  /**
   * 检查体重是否异常
   * @param {Number} weight 体重
   * @param {Object} userData 用户数据
   * @returns {Boolean} 是否异常
   */
  isAbnormalWeight: function(weight, userData) {
    if (!weight || !userData.height) return false;
    
    // 计算BMI
    const heightInMeters = userData.height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // BMI过高或过低都视为异常
    return bmi < 18.5 || bmi > 28;
  },
  
  /**
   * 检查体脂是否异常
   * @param {Number} bodyFat 体脂率
   * @param {Object} userData 用户数据
   * @returns {Boolean} 是否异常
   */
  isAbnormalBodyFat: function(bodyFat, userData) {
    if (!bodyFat || !userData.gender) return false;
    
    // 根据性别判断体脂是否异常
    if (userData.gender === '男' || userData.gender === 1) {
      return bodyFat < 8 || bodyFat > 25;
    } else {
      return bodyFat < 15 || bodyFat > 32;
    }
  }
};

module.exports = statusUtils;