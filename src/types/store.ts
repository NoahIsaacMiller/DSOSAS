// 修复1：调整导入路径，确保类型来源正确
import type { SatelliteEntity, Group, SatelliteBase } from './core'; // 假设这三个类型在core.ts中定义
import type { SatelliteQueryParams, GroupQueryParams } from './api'; // 假设这两个类型在api.ts中定义
import type { Entity } from 'cesium'; // 修复2：显式导入Cesium的Entity类型（SatelliteEntity依赖）

// 卫星状态管理类型
export interface SatelliteStoreState {
    satelliteEntities: SatelliteEntity[]; // 卫星3D实体列表
    selectedSatellite: SatelliteEntity | null; // 当前选中卫星
    satelliteList: SatelliteBase[]; // 卫星基础数据列表
    total: number; // 卫星总条数
    queryParams: SatelliteQueryParams; // 卫星查询参数
}

// 分组状态管理类型
export interface GroupStoreState {
    groupList: Group[]; // 分组列表
    visibleGroupIds: Set<number>; // 可见分组ID集合（使用Set高效管理）
    selectedGroup: Group | null; // 当前选中分组（用于高亮）
    queryParams: GroupQueryParams; // 分组查询参数
}

// 场景状态管理类型
export interface SceneStoreState {
    trackRetentionTime: number; // 轨迹保留时长（默认7200秒=2小时）
    updateFrequency: number; // 卫星更新频率（默认30秒）
    showAllTracks: boolean; // 是否显示所有轨迹（默认false）
    isSceneReady: boolean; // 3D场景是否初始化完成
    viewer?: Entity; // 补充：Cesium Viewer实例（可选，根据实际需求）
}