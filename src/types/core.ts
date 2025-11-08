import type * as Cesium from 'cesium';

// 分组基础类型
export interface Group {
    id: number; // 分组唯一ID（数据库主键）
    groupName: string; // 分组名称（非空、唯一）
    description?: string; // 分组描述（可选）
    status: 0 | 1; // 分组状态（0-禁用，1-启用）
    satelliteCount?: number; // 关联卫星数量（仅列表展示用）
    createAt: string; // 创建时间（ISO格式字符串）
    updateAt: string; // 更新时间（ISO格式字符串）
}

// 卫星基础类型（数据库映射）
export interface SatelliteBase {
    id: number; // 卫星唯一ID（数据库主键）
    name: string; // 卫星名称（非空）
    line1: string; // TLE第一行（非空，符合格式标准）
    line2: string; // TLE第二行（非空，符合格式标准）
    status: 0 | 1; // 卫星状态（0-禁用，1-启用）
    groups: Group[]; // 关联的多个分组（数组）
    createAt: string; // 创建时间（ISO格式字符串）
    updateAt: string; // 更新时间（ISO格式字符串）
}

// 卫星轨道参数类型（后端计算返回）
export interface OrbitalParams {
    semiMajorAxis: number; // 半长轴（km）
    eccentricity: number; // 偏心率
    inclination: number; // 倾角（°）
    argumentOfPerigee: number; // 近地点幅角（°）
    rightAscension: number; // 升交点赤经（°）
    meanAnomaly: number; // 平近点角（°）
    period: number; // 轨道周期（分钟）
}

// 卫星3D实体扩展类型（前端场景使用）
export interface SatelliteEntity extends Cesium.Entity {
    baseData: SatelliteBase; // 关联卫星基础数据
    isVisible: boolean; // 前端显示状态（独立控制）
    trackEntity?: Cesium.Entity; // 关联的轨迹实体
}