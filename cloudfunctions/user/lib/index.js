"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const cloud = __importStar(require("wx-server-sdk"));
const error_1 = require("../../common/types/error");
cloud.init();
const db = cloud.database();
const main = async (event) => {
    var _a, _b;
    try {
        const { OPENID } = cloud.getWXContext();
        if (!OPENID) {
            throw new error_1.AppError(error_1.ErrorCode.UNAUTHORIZED, '未获取到用户身份');
        }
        const { action } = event;
        switch (action) {
            case 'login':
                return await handleLogin(OPENID);
            case 'profile':
                return await handleProfile(OPENID, event.profile);
            case 'bind':
                const bindResult = await cloud.callFunction({
                    name: 'user-bind',
                    data: { inviteCode: event.inviteCode }
                });
                if (!bindResult.result.success) {
                    return {
                        success: false,
                        error: {
                            code: error_1.ErrorCode.INVALID_PARAMS,
                            message: ((_a = bindResult.result.error) === null || _a === void 0 ? void 0 : _a.message) || '绑定失败'
                        }
                    };
                }
                return {
                    success: true,
                    data: bindResult.result.data
                };
            case 'measurement':
                const measurementResult = await cloud.callFunction({
                    name: 'user-measurement',
                    data: {
                        data: event.data,
                        measurementId: event.measurementId
                    }
                });
                if (!measurementResult.result.success) {
                    return {
                        success: false,
                        error: {
                            code: error_1.ErrorCode.INVALID_PARAMS,
                            message: ((_b = measurementResult.result.error) === null || _b === void 0 ? void 0 : _b.message) || '操作失败'
                        }
                    };
                }
                return {
                    success: true,
                    data: measurementResult.result.data
                };
            case 'measurements':
                return await handleMeasurements(OPENID, event.query);
            default:
                throw new error_1.AppError(error_1.ErrorCode.INVALID_PARAMS, '无效的操作类型');
        }
    }
    catch (error) {
        const appError = error_1.AppError.fromError(error);
        return {
            success: false,
            error: {
                code: appError.code,
                message: appError.message
            }
        };
    }
};
exports.main = main;
async function handleLogin(openId) {
    const result = await db.collection('users')
        .where({
        _openid: openId
    })
        .get();
    const users = result.data;
    if (!users.length) {
        const newUser = {
            _openid: openId,
            status: 'active',
            createdAt: new Date(),
            lastLoginAt: new Date()
        };
        const addResult = await db.collection('users').add({
            data: newUser
        });
        return {
            success: true,
            data: Object.assign({ _id: addResult._id }, newUser)
        };
    }
    await db.collection('users').doc(users[0]._id).update({
        data: {
            lastLoginAt: new Date()
        }
    });
    return {
        success: true,
        data: users[0]
    };
}
async function handleProfile(openId, profile) {
    const result = await db.collection('users')
        .where({
        _openid: openId,
        status: 'active'
    })
        .get();
    const users = result.data;
    if (!users.length) {
        throw new error_1.AppError(error_1.ErrorCode.NOT_FOUND, '用户不存在');
    }
    if (!profile) {
        return {
            success: true,
            data: users[0]
        };
    }
    if (profile.height && (profile.height < 100 || profile.height > 250)) {
        throw new error_1.AppError(error_1.ErrorCode.INVALID_PARAMS, '身高数据无效');
    }
    await db.collection('users').doc(users[0]._id).update({
        data: Object.assign(Object.assign({}, profile), { updatedAt: new Date() })
    });
    return {
        success: true,
        data: Object.assign(Object.assign(Object.assign({}, users[0]), profile), { updatedAt: new Date() })
    };
}
async function handleMeasurements(openId, query) {
    const result = await db.collection('users')
        .where({
        _openid: openId,
        status: 'active'
    })
        .get();
    const users = result.data;
    if (!users.length) {
        throw new error_1.AppError(error_1.ErrorCode.NOT_FOUND, '用户不存在');
    }
    const where = {
        userId: users[0]._id
    };
    if ((query === null || query === void 0 ? void 0 : query.startDate) || (query === null || query === void 0 ? void 0 : query.endDate)) {
        where.measuredAt = {};
        if (query.startDate) {
            where.measuredAt.$gte = query.startDate;
        }
        if (query.endDate) {
            where.measuredAt.$lte = query.endDate;
        }
    }
    const measurements = await db.collection('measurements')
        .where(where)
        .orderBy('measuredAt', 'desc')
        .get();
    return {
        success: true,
        data: measurements.data
    };
}
