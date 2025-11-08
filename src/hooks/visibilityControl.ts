import { ref, computed, watch } from 'vue';
import { useGroupStore } from '@/stores/groupStore';
import { useSatelliteStore } from '@/stores/satelliteStore';

/**
 * 显示控制钩子（单卫星）
 * @param satelliteId 卫星ID
 * @param initialVisible 初始显示状态，默认 true
 * @returns 卫星显示状态、切换方法等    
 */
export const useSatelliteVisibility = (satelliteId: number, initialVisible = true) => {
    const groupStore = useGroupStore();
    // 卫星自身显示状态
    const isSatelliteVisible = ref(initialVisible);
    // 卫星所属分组ID列表
    const satelliteGroupIds = ref<number[]>([]);

    // 计算最终显示状态：自身显示 + 至少一个所属分组显示
    const isVisible = computed(() => {
        if (!isSatelliteVisible.value) return false;
        if (satelliteGroupIds.value.length === 0) return true; // 无分组时默认显示

        const visibleGroups = groupStore.visibleGroupIds;
        return satelliteGroupIds.value.some(groupId => visibleGroups.includes(groupId));
    });

    // 切换卫星自身显示状态
    const toggleSatelliteVisible = (visible?: boolean) => {
        isSatelliteVisible.value = visible ?? !isSatelliteVisible.value;
    };

    // 更新卫星所属分组
    const updateSatelliteGroups = (groupIds: number[]) => {
        satelliteGroupIds.value = groupIds;
    };

    return {
        isVisible,
        isSatelliteVisible,
        toggleSatelliteVisible,
        updateSatelliteGroups
    };
};

/**
 * 分组显示控制钩子（全局）
 * @returns 分组显示状态管理工具
 */
export const useGroupVisibility = () => {
    const groupStore = useGroupStore();

    // 获取所有分组的显示状态（Map：groupId -> 显示状态）
    const groupVisibleMap = computed(() => {
        const visibleGroups = groupStore.visibleGroupIds;
        return new Map(
            groupStore.groupList.map(group => [
                group.id,
                visibleGroups.includes(group.id)
            ])
        );
    });

    // 切换单个分组显示状态
    const toggleGroupVisible = (groupId: number) => {
        const currentVisible = groupStore.visibleGroupIds.includes(groupId);
        if (currentVisible) {
            groupStore.setGroupVisibility(
                groupStore.visibleGroupIds.filter(id => id !== groupId)
            );
        } else {
            groupStore.setGroupVisibility([...groupStore.visibleGroupIds, groupId]);
        }
    };

    // 全选/取消全选
    const toggleAllGroups = (selectAll: boolean) => {
        if (selectAll) {
            groupStore.toggleGroupVisibility(groupStore.groupList.map(group => group.id));
        } else {
            groupStore.toggleGroupVisibility(groupStore.groupList.map(group => group.id), false);
        }
    };

    // 批量设置分组显示状态
    const setGroupsVisible = (groupIds: number[]) => {
        groupIds.forEach(groupId => groupStore.toggleGroupVisibility(groupId, true));
    };

    return {
        groupVisibleMap,
        toggleGroupVisible,
        toggleAllGroups,
        setGroupsVisible,
        visibleGroupIds: computed(() => groupStore.visibleGroupIds)
    };
};