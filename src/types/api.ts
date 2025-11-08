import type { Group, SatelliteBase, OrbitalParams } from './core';

/**
 * 后端接口统一响应格式
 * @template T - 响应数据的类型（默认any）
 */
export interface ApiResponse<T = any> {
    code: number; // 状态码（200=成功，其他=失败）
    message: string; // 提示信息（成功/失败描述）
    data: T; // 响应数据（成功时返回的具体内容）
}


// 分页查询通用参数
export interface PageParams {
    page: number; // 页码（默认1）
    size: number; // 每页条数（默认20）
}

// 搜索通用参数
export interface SearchParams {
    keyword?: string; // 搜索关键词（卫星/分组名称）
}

// -------------------------- 卫星接口相关类型 --------------------------
// 新增/编辑卫星请求参数
export interface SatelliteFormParams {
    name: string; // 卫星名称
    line1: string; // TLE第一行
    line2: string; // TLE第二行
    groupIds: number[]; // 关联分组ID数组
}

// 卫星列表查询参数（组合分页+搜索+筛选）
export interface SatelliteQueryParams extends PageParams, SearchParams {
    groupId?: number; // 按分组筛选（可选）
    status?: 0 | 1; // 按状态筛选（可选）
}

// 卫星列表响应结果
export interface SatelliteListResponse {
    total: number; // 总条数
    list: SatelliteBase[]; // 卫星列表数据
    page: number; // 当前页码
    size: number; // 每页条数
}

// 卫星详情响应结果（基础数据+轨道参数）
export interface SatelliteDetailResponse extends SatelliteBase {
    orbitalParams: OrbitalParams; // 轨道参数
}

// -------------------------- 分组接口相关类型 --------------------------
// 新增/编辑分组请求参数
export interface GroupFormParams {
    groupName: string; // 分组名称
    description?: string; // 分组描述（可选）
    status?: 0 | 1; // 分组状态（可选，默认1）
}

// 分组列表查询参数（组合搜索+筛选）
export interface GroupQueryParams extends SearchParams {
    status?: 0 | 1; // 按状态筛选（可选）
}

// 分组列表响应结果
export interface GroupListResponse {
    total: number; // 总条数
    list: Group[]; // 分组列表数据
}

// 分组关联卫星请求参数
export interface GroupSatelliteParams {
    satelliteIds: number[]; // 卫星ID数组
}

// 分组关联卫星响应结果
export interface GroupSatelliteResponse {
    success: boolean;
    associatedCount: number; // 成功关联/解绑的卫星数量
}

export interface GroupQueryParams {
    keyword?: string; // 可选查询参数，根据实际需求扩展
}

export interface GroupListResponse {
    list: Group[]; // 分组数组
    total: number; // 总数（可选，根据接口返回调整）
}

export interface AssociateSatelliteParams {
    satelliteIds: number[]; // 关联的卫星ID数组
}