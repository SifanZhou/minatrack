"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const error_1 = require("../../../common/types/error");
const mockAdd = globals_1.jest.fn().mockResolvedValue({ _id: 'new_id' });
const mockUpdate = globals_1.jest.fn().mockResolvedValue({ updated: 1 });
const mockRemove = globals_1.jest.fn().mockResolvedValue({ removed: 1 });
const mockGet = globals_1.jest.fn().mockResolvedValue({ data: [] });
const mockDocGet = globals_1.jest.fn().mockResolvedValue({ data: {} });
const mockTransaction = {
    collection: globals_1.jest.fn().mockReturnThis(),
    where: globals_1.jest.fn().mockReturnThis(),
    get: globals_1.jest.fn(),
    add: globals_1.jest.fn().mockResolvedValue({ _id: 'new_binding_id' }),
    commit: globals_1.jest.fn().mockResolvedValue(undefined),
    rollback: globals_1.jest.fn().mockResolvedValue(undefined)
};
const mockDb = {
    collection: () => ({
        where: () => ({
            get: mockGet,
            orderBy: () => ({
                get: mockGet
            })
        }),
        doc: () => ({
            get: mockDocGet,
            update: mockUpdate,
            remove: mockRemove
        }),
        add: mockAdd
    }),
    startTransaction: globals_1.jest.fn().mockResolvedValue(mockTransaction)
};
const mockSpecialist = {
    _id: 'specialist_1',
    name: 'Test Specialist',
    status: 'active'
};
globals_1.jest.mock('wx-server-sdk', () => ({
    init: globals_1.jest.fn(),
    getWXContext: () => ({
        OPENID: 'test_open_id'
    }),
    database: () => mockDb,
    callFunction: async ({ name, data }) => {
        if (name === 'user-bind') {
            if (data.inviteCode === 'TEST123') {
                const bindingData = {
                    userId: 'test_open_id',
                    specialistId: 'specialist_1',
                    status: 'pending',
                    createdAt: expect.any(Date)
                };
                await mockTransaction.get
                    .mockResolvedValueOnce({ data: [mockSpecialist] })
                    .mockResolvedValueOnce({ data: [] });
                await mockTransaction.add({ data: bindingData });
                await mockTransaction.commit();
                return {
                    result: {
                        success: true,
                        data: Object.assign({ _id: 'new_binding_id' }, bindingData)
                    }
                };
            }
            else {
                await mockTransaction.get.mockResolvedValueOnce({ data: [] });
                await mockTransaction.rollback();
                return {
                    result: {
                        success: false,
                        error: {
                            code: error_1.ErrorCode.INVALID_PARAMS,
                            message: '无效的邀请码'
                        }
                    }
                };
            }
        }
        else if (name === 'user-measurement') {
            if (data.measurementId) {
                await mockRemove();
                return {
                    result: {
                        success: true,
                        data: { _id: data.measurementId }
                    }
                };
            }
            else if (data.data) {
                if (data.data.weight === 10) {
                    return {
                        result: {
                            success: false,
                            error: {
                                code: error_1.ErrorCode.INVALID_PARAMS,
                                message: '体重数据无效'
                            }
                        }
                    };
                }
                const measurementData = Object.assign(Object.assign({ _id: 'new_measurement_id', userId: 'test_open_id' }, data.data), { measuredAt: expect.any(Date) });
                await mockAdd({ data: measurementData });
                return {
                    result: {
                        success: true,
                        data: measurementData
                    }
                };
            }
        }
        return { result: { success: true } };
    }
}));
const index_1 = require("../index");
describe('用户模块测试', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    describe('登录功能', () => {
        test('新用户首次登录', async () => {
            mockGet.mockResolvedValueOnce({ data: [] });
            const result = await (0, index_1.main)({
                action: 'login'
            });
            expect(result.success).toBe(true);
            expect(mockAdd).toHaveBeenCalled();
        });
        test('已存在用户登录', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{
                        _id: 'existing_user',
                        _openid: 'test_open_id',
                        status: 'active'
                    }]
            });
            const result = await (0, index_1.main)({
                action: 'login'
            });
            expect(result.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalled();
        });
    });
    describe('个人资料', () => {
        test('获取个人资料', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{
                        _id: 'user_1',
                        nickname: 'Test User',
                        height: 175
                    }]
            });
            const result = await (0, index_1.main)({
                action: 'profile'
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toHaveProperty('nickname');
            }
        });
        test('更新个人资料 - 有效数据', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{
                        _id: 'user_1',
                        status: 'active'
                    }]
            });
            const result = await (0, index_1.main)({
                action: 'profile',
                profile: {
                    nickname: 'New Name',
                    height: 180
                }
            });
            expect(result.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalled();
        });
        test('更新个人资料 - 无效身高', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{
                        _id: 'user_1',
                        status: 'active'
                    }]
            });
            const result = await (0, index_1.main)({
                action: 'profile',
                profile: {
                    height: 90
                }
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                if (!result.success) {
                    expect(result.error.code).toBe(error_1.ErrorCode.INVALID_PARAMS);
                }
            }
        });
    });
    describe('测量记录', () => {
        test('获取测量记录列表', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{
                        _id: 'user_1',
                        status: 'active'
                    }]
            });
            const result = await (0, index_1.main)({
                action: 'measurements',
                query: {
                    startDate: new Date(),
                    endDate: new Date()
                }
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);
            }
        });
        test('获取测量记录 - 用户不存在', async () => {
            mockGet.mockResolvedValueOnce({ data: [] });
            const result = await (0, index_1.main)({
                action: 'measurements'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(error_1.ErrorCode.NOT_FOUND);
            }
        });
    });
    describe('错误处理', () => {
        test('无效的操作类型', async () => {
            const result = await (0, index_1.main)({
                action: 'invalid'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                if (!result.success) {
                    expect(result.error.code).toBe(error_1.ErrorCode.INVALID_PARAMS);
                }
            }
        });
        test('未授权访问', async () => {
            globals_1.jest.spyOn(require('wx-server-sdk'), 'getWXContext').mockReturnValueOnce({});
            const result = await (0, index_1.main)({
                action: 'login'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(error_1.ErrorCode.UNAUTHORIZED);
            }
        });
    });
});
