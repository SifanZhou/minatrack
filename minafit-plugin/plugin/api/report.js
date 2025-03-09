/**
 * 体脂秤数据报告生成模块
 * 用于处理原始测量数据并生成结构化的检测报告
 */

// 体脂率评估标准（根据性别和年龄段）
const bodyFatStandards = {
  male: {
    // 年龄范围: [偏低, 标准, 偏高, 肥胖]
    '18-39': [10, 21, 26, 100],
    '40-59': [11, 22, 27, 100],
    '60+': [13, 24, 29, 100]
  },
  female: {
    '18-39': [18, 33, 39, 100],
    '40-59': [19, 34, 40, 100],
    '60+': [21, 36, 42, 100]
  }
};

// 肌肉率评估标准
const muscleMassStandards = {
  male: {
    '18-39': [33.3, 39.3, 44.0],
    '40-59': [33.1, 39.1, 43.8],
    '60+': [32.9, 38.9, 43.6]
  },
  female: {
    '18-39': [24.3, 30.3, 35.3],
    '40-59': [24.1, 30.1, 35.1],
    '60+': [23.9, 29.9, 34.9]
  }
};

// 内脏脂肪评估标准
const visceralFatStandards = [
  9,   // 标准
  14,  // 偏高
  100  // 肥胖
];

// 基础代谢率评估（根据性别和年龄的平均值）
const bmrStandards = {
  male: {
    '18-29': 1550,
    '30-49': 1500,
    '50+': 1350
  },
  female: {
    '18-29': 1200,
    '30-49': 1150,
    '50+': 1100
  }
};

/**
 * 获取年龄段范围
 * @param {number} age 年龄
 * @returns {string} 年龄段
 */
function getAgeRange(age) {
  if (age < 18) return '18-39'; // 未成年按照成年人最低标准计算
  if (age <= 39) return '18-39';
  if (age <= 59) return '40-59';
  return '60+';
}

/**
 * 评估体脂率
 * @param {number} bodyFat 体脂率
 * @param {number} gender 性别(0:男, 1:女)
 * @param {number} age 年龄
 * @returns {object} 评估结果
 */
function evaluateBodyFat(bodyFat, gender, age) {
  const genderKey = gender === 0 ? 'male' : 'female';
  const ageRange = getAgeRange(age);
  const standards = bodyFatStandards[genderKey][ageRange];
  
  let level, suggestion;
  
  if (bodyFat < standards[0]) {
    level = '偏低';
    suggestion = '体脂率偏低，建议适当增加营养摄入，保持健康饮食';
  } else if (bodyFat < standards[1]) {
    level = '标准';
    suggestion = '体脂率处于健康范围，继续保持良好的生活习惯';
  } else if (bodyFat < standards[2]) {
    level = '偏高';
    suggestion = '体脂率偏高，建议增加有氧运动，控制饮食摄入';
  } else {
    level = '肥胖';
    suggestion = '体脂率过高，建议咨询专业人士制定减脂计划，控制饮食并增加运动量';
  }
  
  return {
    value: bodyFat,
    level,
    suggestion,
    standardRange: [standards[0], standards[1]]
  };
}

/**
 * 评估肌肉率
 * @param {number} muscleMass 肌肉率
 * @param {number} gender 性别(0:男, 1:女)
 * @param {number} age 年龄
 * @returns {object} 评估结果
 */
function evaluateMuscleMass(muscleMass, gender, age) {
  const genderKey = gender === 0 ? 'male' : 'female';
  const ageRange = getAgeRange(age);
  const standards = muscleMassStandards[genderKey][ageRange];
  
  let level, suggestion;
  
  if (muscleMass < standards[0]) {
    level = '偏低';
    suggestion = '肌肉率偏低，建议增加力量训练，提高蛋白质摄入';
  } else if (muscleMass < standards[1]) {
    level = '标准';
    suggestion = '肌肉率处于健康范围，继续保持适当的力量训练';
  } else {
    level = '优秀';
    suggestion = '肌肉率优秀，继续保持良好的训练习惯';
  }
  
  return {
    value: muscleMass,
    level,
    suggestion,
    standardRange: [standards[0], standards[1]]
  };
}

/**
 * 评估内脏脂肪
 * @param {number} visceralFat 内脏脂肪等级
 * @returns {object} 评估结果
 */
function evaluateVisceralFat(visceralFat) {
  let level, suggestion;
  
  if (visceralFat < visceralFatStandards[0]) {
    level = '标准';
    suggestion = '内脏脂肪处于健康范围，继续保持良好的生活习惯';
  } else if (visceralFat < visceralFatStandards[1]) {
    level = '偏高';
    suggestion = '内脏脂肪偏高，建议增加有氧运动，减少高脂高糖食物摄入';
  } else {
    level = '过高';
    suggestion = '内脏脂肪过高，存在健康风险，建议咨询医生并制定减脂计划';
  }
  
  return {
    value: visceralFat,
    level,
    suggestion,
    standardRange: [0, visceralFatStandards[0]]
  };
}

/**
 * 评估基础代谢率
 * @param {number} bmr 基础代谢率
 * @param {number} gender 性别(0:男, 1:女)
 * @param {number} age 年龄
 * @returns {object} 评估结果
 */
function evaluateBMR(bmr, gender, age) {
  const genderKey = gender === 0 ? 'male' : 'female';
  let ageKey = '50+';
  
  if (age < 30) {
    ageKey = '18-29';
  } else if (age < 50) {
    ageKey = '30-49';
  }
  
  const standardBMR = bmrStandards[genderKey][ageKey];
  const ratio = bmr / standardBMR;
  
  let level, suggestion;
  
  if (ratio < 0.9) {
    level = '偏低';
    suggestion = '基础代谢率偏低，建议增加肌肉量，适当增加蛋白质摄入';
  } else if (ratio <= 1.1) {
    level = '标准';
    suggestion = '基础代谢率正常，继续保持健康的生活方式';
  } else {
    level = '优秀';
    suggestion = '基础代谢率较高，有利于维持体重，继续保持良好的运动习惯';
  }
  
  return {
    value: bmr,
    level,
    suggestion,
    standardValue: standardBMR
  };
}

/**
 * 生成体重评估
 * @param {number} weight 体重(kg)
 * @param {number} height 身高(cm)
 * @returns {object} 评估结果
 */
function evaluateWeight(weight, height) {
  // BMI计算: 体重(kg) / 身高(m)^2
  const heightInMeter = height / 100;
  const bmi = weight / (heightInMeter * heightInMeter);
  
  let level, suggestion;
  
  if (bmi < 18.5) {
    level = '偏轻';
    suggestion = 'BMI偏低，建议适当增加营养摄入，均衡饮食';
  } else if (bmi < 24) {
    level = '标准';
    suggestion = 'BMI处于健康范围，继续保持良好的生活习惯';
  } else if (bmi < 28) {
    level = '偏重';
    suggestion = 'BMI偏高，建议控制饮食摄入，增加有氧运动';
  } else {
    level = '肥胖';
    suggestion = 'BMI过高，建议咨询专业人士制定减重计划';
  }
  
  return {
    weight,
    bmi: parseFloat(bmi.toFixed(1)),
    level,
    suggestion,
    standardRange: [18.5, 24]
  };
}

/**
 * 生成体脂检测报告
 * @param {object} weightData 体重数据
 * @param {object} bodyData 体脂数据
 * @param {object} hrData 心率数据
 * @param {object} userInfo 用户信息
 * @returns {object} 检测报告
 */
function generateReport(weightData, bodyData, hrData, userInfo) {
  if (!weightData || !bodyData) {
    throw new Error('缺少必要的测量数据');
  }
  
  const { age, height, gender } = userInfo;
  const { weight } = weightData;
  const { bodyFat, muscleMass, visceralFat, bmr, bodyWater, boneMass } = bodyData;
  
  // 生成报告时间
  const reportTime = new Date().toISOString();
  
  // 构建报告对象
  const report = {
    reportId: `report_${Date.now()}`,
    reportTime,
    userInfo: {
      age,
      height,
      gender
    },
    weightAssessment: evaluateWeight(weight, height),
    bodyComposition: {
      bodyFat: evaluateBodyFat(bodyFat, gender, age),
      muscleMass: evaluateMuscleMass(muscleMass, gender, age),
      visceralFat: evaluateVisceralFat(visceralFat),
      bmr: evaluateBMR(bmr, gender, age),
      bodyWater: {
        value: bodyWater,
        standardRange: gender === 0 ? [55, 65] : [45, 60]
      },
      boneMass: {
        value: boneMass
      }
    },
    heartRate: hrData ? {
      value: hrData.hr,
      standardRange: [60, 100]
    } : null,
    overallAssessment: {}
  };
  
  // 生成综合评估
  const bodyFatLevel = report.bodyComposition.bodyFat.level;
  const muscleLevel = report.bodyComposition.muscleMass.level;
  const weightLevel = report.weightAssessment.level;
  
  let overallLevel, overallSuggestion;
  
  if (bodyFatLevel === '标准' && muscleLevel === '标准' && weightLevel === '标准') {
    overallLevel = '优秀';
    overallSuggestion = '您的身体各项指标均处于健康范围，请继续保持良好的生活习惯';
  } else if (bodyFatLevel === '肥胖' || weightLevel === '肥胖') {
    overallLevel = '需注意';
    overallSuggestion = '您的体脂率或体重指标偏高，建议咨询专业人士制定健康计划，控制饮食并增加运动量';
  } else if (bodyFatLevel === '偏高' || weightLevel === '偏重') {
    overallLevel = '一般';
    overallSuggestion = '您的部分指标偏高，建议增加有氧运动，控制饮食摄入，保持健康生活方式';
  } else if (muscleLevel === '偏低') {
    overallLevel = '一般';
    overallSuggestion = '您的肌肉率偏低，建议增加力量训练，提高蛋白质摄入，改善身体成分';
  } else {
    overallLevel = '良好';
    overallSuggestion = '您的身体状况总体良好，可针对个别指标进行适当改善';
  }
  
  report.overallAssessment = {
    level: overallLevel,
    suggestion: overallSuggestion
  };
  
  return report;
}

module.exports = {
  generateReport,
  evaluateBodyFat,
  evaluateMuscleMass,
  evaluateVisceralFat,
  evaluateBMR,
  evaluateWeight
};