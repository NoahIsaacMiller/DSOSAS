import { defineStore } from 'pinia';
import type { GroupStoreState } from '@/types/store';
import type { Group } from '@/types/core';
import type {
    GroupQueryParams,
    GroupListResponse,
    GroupSatelliteParams,
} from '@/types/api';
import { getGroupList, associateSatellitesToGroup } from '@/api/group';

export const useGroupStore = defineStore('group', {
    state: (): GroupStoreState => ({
        groupList: [],
        visibleGroupIds: new Set(),
        selectedGroup: null,
        queryParams: {} as GroupQueryParams
    }),
    actions: {
        async fetchGroupList(params: GroupQueryParams) {
            this.queryParams = params;
            // 关键修复：直接提取 AxiosResponse 中的 data（业务数据）
            const response = await getGroupList(params);
            const data = response.data as GroupListResponse; // 明确业务数据类型
            this.groupList = data.list; // 此时 data 含 list 和 total，无错误
            if (this.visibleGroupIds.size === 0) {
                data.list.forEach(group => this.visibleGroupIds.add(group.id));
            }
        },

        toggleGroupVisibility(groupId: number, isVisible: boolean) {
            if (isVisible) {
                this.visibleGroupIds.add(groupId);
            } else {
                this.visibleGroupIds.delete(groupId);
            }
        },

        async associateSatellites(id: number, satelliteIds: number[]) {
            const params: GroupSatelliteParams = { satelliteIds };
            await associateSatellitesToGroup(id, params);
            this.fetchGroupList(this.queryParams);
        }
    },
    getters: {
        visibleGroups(): Group[] {
            return this.groupList.filter(group => this.visibleGroupIds.has(group.id));
        }
    }
});