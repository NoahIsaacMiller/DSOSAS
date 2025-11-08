import { request } from './request';
import type { SatelliteBase, OrbitalParams } from '@/types/core';
import type { ApiResponse } from '@/types/api';
/**
 * 批量获取卫星轨道参数（用于详情页展示）
 * @param satelliteIds 卫星ID数组
 */
export const getBatchOrbitalParams = (satelliteIds: number[]) => {
    return request<ApiResponse<Record<number, OrbitalParams>>>({
        url: '/scene/orbital-params',
        method: 'POST',
        data: { satelliteIds }
    });
};

/**
 * 同步最新TLE数据（从第三方数据源更新）
 */
export const syncLatestTle = () => {
    return request<ApiResponse<{ updatedCount: number }>>({
        url: '/scene/sync-tle',
        method: 'POST'
    });
};