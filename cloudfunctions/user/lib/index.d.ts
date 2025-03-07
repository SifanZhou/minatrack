import { ApiResponse } from '../../common/types/api';
interface UserProfile {
    nickname?: string;
    height?: number;
    targetWeight?: number;
}
export declare const main: (event: {
    action: "login" | "profile" | "bind" | "measurement" | "measurements";
    profile?: UserProfile;
    inviteCode?: string;
    data?: any;
    measurementId?: string;
    query?: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    };
}) => Promise<ApiResponse>;
export {};
