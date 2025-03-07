export const formatWeight = (weight: number): string => {
  return weight.toFixed(2);
};

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatTime = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 格式化体脂率
export const formatBodyFat = (bodyFat: number): string => {
  return bodyFat.toFixed(1) + '%';
};

// 格式化BMI
export const formatBMI = (bmi: number): string => {
  return bmi.toFixed(1);
};

// 格式化体重变化
export const formatWeightChange = (change: number): string => {
  if (change === 0) return '0kg';
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}kg`;
};

// 格式化日期范围
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
};

// 格式化时间戳为日期
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return formatDate(date);
};

// 格式化活跃状态
export const formatActivityStatus = (lastUpdate: Date): string => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return `${Math.floor(diffDays / 30)}个月前`;
};