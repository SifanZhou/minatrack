import * as cloud from 'wx-server-sdk';
import { ApiResponse } from '../../../common/types/api';
import { ErrorCode, AppError } from '../../../common/types/error';

cloud.init();
const db = cloud.database();

interface MeasurementData {
  weight: number;
  bodyFat?: number;
  note?: string;
}

export const main = async (event: {
  data?: MeasurementData;
  measurementId?: string;
}): Promise<ApiResponse> => {
  const { OPENID } = cloud.getWXContext();
  const { data, measurementId } = event;

  try {
    if (measurementId) {
      // 删除测量记录
      await db.collection('measurements').doc(measurementId).remove();
      return {
        success: true,
        data: { _id: measurementId }
      };
    }

    if (!data) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '缺少测量数据');
    }

    if (data.weight < 20 || data.weight > 200) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '体重数据无效');
    }

    const measurement = {
      userId: OPENID,
      ...data,
      measuredAt: new Date()
    };

    const result = await db.collection('measurements').add({
      data: measurement
    });

    return {
      success: true,
      data: {
        _id: (result as cloud.DB.IAddResult)._id,
        ...measurement
      }
    };
  } catch (error) {
    const appError = AppError.fromError(error);
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message
      }
    };
  }
};