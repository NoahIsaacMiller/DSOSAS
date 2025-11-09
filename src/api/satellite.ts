import { request } from './request';
import type {
    ApiResponse,
    SatelliteFormParams,
    SatelliteQueryParams,
    SatelliteListResponse,
    SatelliteDetailResponse,
} from '@/types/api';
import type { AxiosResponse } from 'axios';

import type { SatelliteBase } from '@/types/core';

/**
 * 获取卫星列表（支持分页、搜索、筛选）
 * @param params 查询参数
 */
export const getSatelliteList = (params: SatelliteQueryParams) => {
    return request.get<SatelliteListResponse>('/satellites', { params });
};


/**
 * 获取单颗卫星详情（含轨道参数）
 * @param id 卫星ID
 */
export const getSatelliteDetail = (id: number) => {
    return request.get<SatelliteDetailResponse>(`/satellites/${id}`);
};
/**
 * 新增卫星
 * @param data 卫星表单数据
 */
export const addSatellite = (data: SatelliteFormParams) => {
    return request<ApiResponse<SatelliteBase>>({
        url: '/satellites',
        method: 'POST',
        data
    });
};

/**
 * 编辑卫星
 * @param id 卫星ID
 * @param data 卫星表单数据
 */
export const editSatellite = (id: number, data: SatelliteFormParams) => {
    return request<ApiResponse<SatelliteBase>>({
        url: `/satellites/${id}`,
        method: 'PUT',
        data
    });
};

/**
 * 删除卫星
 * @param id 卫星ID
 */
export const deleteSatellite = (id: number) => {
    return request<ApiResponse<boolean>>({
        url: `/satellites/${id}`,
        method: 'DELETE'
    });
};

/**
 * 导出卫星TLE数据（CSV格式）
 * @param id 卫星ID
 */
export const exportSatelliteTle = (id: number) => {
    return request<ApiResponse<Blob>>({
        url: `/satellites/${id}/export-tle`,
        method: 'GET',
        responseType: 'blob' // 二进制流响应
    });
};