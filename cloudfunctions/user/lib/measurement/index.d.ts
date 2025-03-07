import { ApiResponse } from '../../../common/types/api';
interface MeasurementData {
    weight: number;
    bodyFat?: number;
    note?: string;
}
export declare const main: (event: {
    data?: MeasurementData;
    measurementId?: string;
}) => Promise<ApiResponse>;
export {};
