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
const error_1 = require("../../../common/types/error");
cloud.init();
const db = cloud.database();
const main = async (event) => {
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
            throw new error_1.AppError(error_1.ErrorCode.INVALID_PARAMS, '缺少测量数据');
        }
        if (data.weight < 20 || data.weight > 200) {
            throw new error_1.AppError(error_1.ErrorCode.INVALID_PARAMS, '体重数据无效');
        }
        const measurement = Object.assign(Object.assign({ userId: OPENID }, data), { measuredAt: new Date() });
        const result = await db.collection('measurements').add({
            data: measurement
        });
        return {
            success: true,
            data: Object.assign({ _id: result._id }, measurement)
        };
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
