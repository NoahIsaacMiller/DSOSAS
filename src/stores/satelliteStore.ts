import { defineStore } from 'pinia';
import type { SatelliteStoreState } from '@/types/store';
import type { SatelliteEntity, SatelliteBase } from '@/types/core';
import type {
    SatelliteQueryParams,
    SatelliteDetailResponse,
    SatelliteListResponse,
} from '@/types/api';
import type { AxiosResponse } from 'axios';
import { getSatelliteList, getSatelliteDetail } from '@/api/satellite';

export const useSatelliteStore = defineStore('satellite', {
    state: (): SatelliteStoreState => ({
        satelliteEntities: [],
        selectedSatellite: null,
        satelliteList: [],
        total: 0,
        queryParams: { page: 1, size: 20 }
    }),
    actions: {
        async fetchSatelliteList(params: SatelliteQueryParams) {
            this.queryParams = params;
            // 处理嵌套的 AxiosResponse（解开两层包裹）
            const nestedResponse: AxiosResponse<AxiosResponse<SatelliteListResponse>> = await getSatelliteList(params);
            // 提取最内层的业务数据
            const data = nestedResponse.data.data;
            this.satelliteList = data.list;
            this.total = data.total;
        },

        async fetchSatelliteDetail(id: number): Promise<SatelliteDetailResponse> {
            // 同理处理详情接口的嵌套响应
            const nestedResponse: AxiosResponse<AxiosResponse<SatelliteDetailResponse>> = await getSatelliteDetail(id);
            return nestedResponse.data.data;
        },

        addSatelliteEntity(entity: SatelliteEntity) {
            this.satelliteEntities.push(entity);
        },

        toggleSatelliteVisibility(id: number, isVisible: boolean) {
            const entity = this.satelliteEntities.find(item => item.baseData.id === id);
            if (entity) entity.isVisible = isVisible;
        }
    }
});