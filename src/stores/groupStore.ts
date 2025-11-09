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
            try {
                // 响应拦截器已处理，直接获取业务数据
                const data = await getGroupList(params);
                
                // 确保数据不为空且有必要属性
                if (data && typeof data === 'object') {
                    this.groupList = Array.isArray(data.list) ? data.list : [];
                    
                    // 只有当有数据且可见组集合为空时，才添加所有组到可见集合
                    if (this.visibleGroupIds.size === 0 && Array.isArray(data.list)) {
                        data.list.forEach(group => {
                            if (group && typeof group.id === 'number') {
                                this.visibleGroupIds.add(group.id);
                            }
                        });
                    }
                } else {
                    // 如果数据格式不正确，使用默认值
                    this.groupList = [];
                    console.warn('API返回的组数据格式不正确:', data);
                }
            } catch (error) {
                console.error('获取组列表失败:', error);
                // 出错时确保列表为空数组而不是undefined
                this.groupList = [];
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