import { errorHandler } from '../error-handler';
import { AppError, ErrorCode } from '../types/error';
import { ApiResponse, ApiErrorResponse } from '../types/api';

describe('错误处理中间件测试', () => {
  test('处理 AppError', async () => {
    const error = new AppError(
      ErrorCode.UNAUTHORIZED,
      '未授权访问'
    );

    const result = await errorHandler(error) as ApiErrorResponse;
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(result.error.message).toBe('未授权访问');
  });

  test('处理普通 Error', async () => {
    const error = new Error('测试错误');
    
    const result = await errorHandler(error) as ApiErrorResponse;
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(result.error.message).toBe('测试错误');
  });
});