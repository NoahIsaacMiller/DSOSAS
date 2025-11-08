import { request } from './request';
import type {
    PageParams,
    GroupFormParams,
    GroupQueryParams,
    GroupListResponse,
    GroupSatelliteParams,
    SatelliteListResponse,
    GroupSatelliteResponse
} from '@/types/api';

import type { Group } from '@/types/core';

/**
 * 获取分组列表（支持搜索、筛选）
 * @param params 查询参数（默认空对象）
 */
export const getGroupList = (params?: GroupQueryParams) => {
    // 关键：返回类型是 GroupListResponse（业务数据），而非 AxiosResponse
    return request.get<GroupListResponse>('/groups', { params });
};


/**
 * 获取分组详情（含关联卫星数量）
 * @param id 分组ID
 */
export const getGroupDetail = (id: number) => {
    return request.get<Group>(`/groups/${id}`);
};

/**
 * 新增分组
 * @param data 分组表单数据
 */
export const addGroup = (data: GroupFormParams) => {
    return request.post<Group>('/groups', data);
};

/**
 * 编辑分组
 * @param id 分组ID
 * @param data 分组表单数据
 */
export const editGroup = (id: number, data: GroupFormParams) => {
    return request.put<Group>(`/groups/${id}`, data);
};

/**
 * 删除分组
 * @param id 分组ID
 */
export const deleteGroup = (id: number) => {
    return request.delete<boolean>(`/groups/${id}`);
};

/**
 * 获取分组关联的卫星列表
 * @param id 分组ID
 * @param params 分页参数
 */
export const getGroupSatellites = (id: number, params: PageParams) => {
    return request.get<SatelliteListResponse>(`/groups/${id}/satellites`, { params });
};

/**
 * 批量关联卫星到分组
 * @param id 分组ID
 * @param data 卫星ID数组
 */
export const associateSatellitesToGroup = (id: number, data: GroupSatelliteParams) => {
    return request.post<GroupSatelliteResponse>(`/groups/${id}/satellites`, data);
};

/**
 * 批量解绑分组中的卫星
 * @param id 分组ID
 * @param data 卫星ID数组
 */
export const disassociateSatellitesFromGroup = (id: number, data: GroupSatelliteParams) => {
    return request.delete<GroupSatelliteResponse>(`/groups/${id}/satellites`, { data });
};