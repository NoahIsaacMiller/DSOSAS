import { defineStore } from 'pinia';
import type { SatelliteStoreState } from '@/types/store';
import type { SatelliteEntity, SatelliteBase } from '@/types/core';
import type {
    SatelliteQueryParams,
    SatelliteDetailResponse,
    SatelliteListResponse,
} from '@/types/api';
import { getSatelliteList, getSatelliteDetail } from '@/api/satellite';
import { useTLELoader } from '../hooks/tleLoader';

interface TleSatelliteData {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  type?: string;
  groupId?: number;
}

export const useSatelliteStore = defineStore('satellite', {
    state: (): SatelliteStoreState & { 
        tleLoading: boolean;
        tleError: string | null;
    } => ({
        satelliteEntities: [],
        selectedSatellite: null,
        satelliteList: [],
        total: 0,
        queryParams: { page: 1, size: 20 },
        tleLoading: false,
        tleError: null
    }),
    actions: {
        async fetchSatelliteList(params: SatelliteQueryParams) {
            this.queryParams = params;
            try {
                // 响应拦截器已处理，直接获取业务数据
                const data = await getSatelliteList(params);
                // 确保数据不为空且有必要属性
                if (data && typeof data === 'object') {
                    this.satelliteList = Array.isArray(data.list) ? data.list : [];
                    this.total = typeof data.total === 'number' ? data.total : 0;
                } else {
                    // 如果数据格式不正确，使用默认值
                    this.satelliteList = [];
                    this.total = 0;
                    console.warn('API返回的数据格式不正确:', data);
                }
            } catch (error) {
                console.error('获取卫星列表失败:', error);
                // 出错时确保列表为空数组而不是undefined
                this.satelliteList = [];
                this.total = 0;
            }
        },

        async fetchSatelliteDetail(id: number): Promise<SatelliteDetailResponse> {
            // 直接返回业务数据
            return await getSatelliteDetail(id);
        },

        addSatelliteEntity(entity: SatelliteEntity) {
            this.satelliteEntities.push(entity);
        },

        toggleSatelliteVisibility(id: number, isVisible: boolean) {
            const entity = this.satelliteEntities.find(item => item.baseData.id === id);
            if (entity) entity.isVisible = isVisible;
        },
        
        // 从TLE数据加载卫星 - 现在由ThreeEarth组件直接处理
        async loadSatellitesFromTleData(limit: number = 50) {
            
            const { tleData, isLoading: tleLoading, error: tleError, loadTLEData } = useTLELoader();
            this.tleLoading = true;
            this.tleError = null;
            
            try {
                // 加载TLE数据
                await loadTLEData();
                
                if (tleLoading.value) {
                    console.log('TLE数据正在加载...');
                    return;
                }
                
                if (tleError.value) {
                    this.tleError = tleError.value;
                    console.error('TLE数据加载失败:', tleError.value);
                    return;
                }
                
                if (!tleData.value || tleData.value.length === 0) {
                    console.log('没有可用的TLE数据');
                    return;
                }
                
                // 添加卫星（限制数量以避免性能问题）
                const satellitesToAdd = tleData.value.slice(0, limit).map((tle: any, index: number) => ({
                    id: `satellite_${index}`,
                    name: tle.name,
                    tle1: tle.line1,
                    tle2: tle.line2,
                    type: 'TLE',
                }));
                
                console.log(`正在添加 ${satellitesToAdd.length} 个卫星实体...`);
                this.addSatelliteEntitiesFromTle(satellitesToAdd);
                console.log('卫星实体添加完成');
            } catch (err) {
                this.tleError = err instanceof Error ? err.message : '加载TLE数据时发生未知错误';
                console.error('从TLE数据加载卫星失败:', err);
            } finally {
                this.tleLoading = false;
            }
        },
        
        // 添加TLE卫星实体 - 现在由ThreeEarth组件直接处理
        addSatelliteEntitiesFromTle(satellites: TleSatelliteData[]) {
            // 卫星实体创建现在在ThreeEarth组件中处理
            // 这里仅保存卫星数据到store
            satellites.forEach((satelliteData: TleSatelliteData) => {
                // 移除现有的相同ID实体
                const existingEntityIndex = this.satelliteEntities.findIndex(
                    entity => entity.id === satelliteData.id
                );
                if (existingEntityIndex >= 0) {
                    this.satelliteEntities.splice(existingEntityIndex, 1);
                }

                // 仅添加卫星数据到store，不创建可视化实体
                const satelliteEntity: any = {
                    id: satelliteData.id,
                    name: satelliteData.name,
                    baseData: {
                        id: satelliteData.id,
                        name: satelliteData.name
                    },
                    tle1: satelliteData.tle1,
                    tle2: satelliteData.tle2,
                    type: satelliteData.type,
                    isVisible: true
                };
                
                this.addSatelliteEntity(satelliteEntity);
            });
        }
    }
});