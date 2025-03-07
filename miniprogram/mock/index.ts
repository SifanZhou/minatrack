// 模拟数据
export const mockData: Record<string, any> = {
  // 用户相关模拟数据
  user: {
    login: (data: any) => {
      return {
        token: 'mock_token_123456',
        isSpecialist: false,
        userId: 'mock_user_id'
      };
    },
    register: (data: any) => {
      return {
        success: true,
        userId: 'mock_user_id'
      };
    },
    getUserInfo: () => {
      return {
        _id: 'mock_user_id',
        nickName: '测试用户',
        avatarUrl: '',
        gender: 1,
        height: 175,
        weight: 70,
        birthday: '1990-01-01'
      };
    },
    getMeasurements: () => {
      return {
        data: [
          {
            _id: 'mock_measurement_id_1',
            weight: 70.5,
            bodyfat: 20.1,
            date: '2023-07-15',
            time: '08:30'
          },
          {
            _id: 'mock_measurement_id_2',
            weight: 70.2,
            bodyfat: 19.8,
            date: '2023-07-10',
            time: '08:45'
          }
        ]
      };
    },
    getLatestBodyfat: () => {
      return {
        data: {
          _id: 'mock_measurement_id',
          weight: 70.5,
          bodyfat: 20.1,
          muscle: 55.2,
          water: 65.3,
          protein: 16.8,
          visceral: 8,
          bone: 3.2,
          metabolicAge: 28,
          date: '2023-07-15',
          time: '08:30'
        }
      };
    },
    uploadBodyfat: (data: any) => {
      return {
        success: true,
        _id: 'new_mock_measurement_id'
      };
    },  // 这里添加了逗号
    
    getBodyfatHistory: (data: any) => {
      return {
        data: [
          {
            _id: 'mock_measurement_id_1',
            weight: 70.5,
            bodyfat: 20.1,
            muscle: 55.2,
            water: 65.3,
            protein: 16.8,
            visceral: 8,
            bone: 3.2,
            metabolicAge: 28,
            date: '2023-07-15',
            time: '08:30'
          },
          {
            _id: 'mock_measurement_id_2',
            weight: 70.2,
            bodyfat: 19.8,
            muscle: 55.5,
            water: 65.5,
            protein: 16.9,
            visceral: 8,
            bone: 3.2,
            metabolicAge: 28,
            date: '2023-07-10',
            time: '08:45'
          },
          {
            _id: 'mock_measurement_id_3',
            weight: 71.0,
            bodyfat: 20.5,
            muscle: 54.8,
            water: 65.0,
            protein: 16.7,
            visceral: 8,
            bone: 3.2,
            metabolicAge: 28,
            date: '2023-07-05',
            time: '09:00'
          }
        ]
      };
    }
  },
  
  // 设备相关模拟数据
  device: {
    getInfo: (data: any) => {
      return {
        deviceId: data.deviceId || 'mock_device_id',
        name: '智能体脂秤',
        type: 'scale',
        model: 'BF-001',
        manufacturer: 'MinaTrack',
        version: '1.0.0'
      };
    },
    connect: () => {
      return { success: true };
    },
    disconnect: () => {
      return { success: true };
    },
    syncData: () => {
      return {
        success: true,
        data: {
          weight: 70.5,
          bodyfat: 20.1,
          muscle: 55.2,
          water: 65.3,
          protein: 16.8,
          visceral: 8,
          bone: 3.2,
          metabolicAge: 28
        }
      };
    }
  },
  
  // 专家相关模拟数据
  specialist: {
    getClients: () => {
      return {
        data: [
          {
            _id: 'mock_client_id_1',
            nickName: '客户A',
            avatarUrl: '',
            lastUpdate: '2023-07-15',
            latestBodyfat: {
              weight: 65.5,
              bodyfat: 18.2,
              date: '2023-07-15'
            }
          },
          {
            _id: 'mock_client_id_2',
            nickName: '客户B',
            avatarUrl: '',
            lastUpdate: '2023-07-10',
            latestBodyfat: {
              weight: 72.1,
              bodyfat: 22.5,
              date: '2023-07-10'
            }
          }
        ]
      };
    },
    getClientDetail: () => {
      return {
        data: {
          _id: 'mock_client_id_1',
          nickName: '客户A',
          avatarUrl: '',
          gender: 1,
          height: 170,
          weight: 65.5,
          birthday: '1995-05-15',
          bodyfatHistory: [
            {
              _id: 'mock_measurement_id_1',
              weight: 65.5,
              bodyfat: 18.2,
              date: '2023-07-15',
              time: '08:30'
            },
            {
              _id: 'mock_measurement_id_2',
              weight: 66.0,
              bodyfat: 18.5,
              date: '2023-07-10',
              time: '09:00'
            }
          ]
        }
      };
    },
    generateReport: () => {
      return { success: true };
    },
    generateInviteCode: () => {
      return { code: 'INVITE123' };
    },
    getSubscription: () => {
      return {
        plans: [
          {
            id: 'plan_basic',
            name: '基础版',
            price: 99,
            duration: 30,
            features: ['基础客户管理', '基础报告生成']
          },
          {
            id: 'plan_pro',
            name: '专业版',
            price: 299,
            duration: 90,
            features: ['高级客户管理', '高级报告生成', '数据分析']
          }
        ]
      };
    },
    subscribe: () => {
      return { success: true };
    }
  }
};