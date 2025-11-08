import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 场景配置类型定义
interface SceneConfig {
    trackDuration: number; // 轨迹保留时长（秒）
    updateFrequency: number; // 位置更新频率（毫秒）
    currentView: {
        longitude: number;
        latitude: number;
        height: number;
        heading: number;
        pitch: number;
        roll: number;
    };
}

export const useSceneStore = defineStore('scene', () => {
    // 场景配置
    const sceneConfig = ref<SceneConfig>({
        trackDuration: 3600, // 默认1小时
        updateFrequency: 1000, // 默认1秒
        currentView: {
            longitude: 105,
            latitude: 30,
            height: 15000000,
            heading: 0,
            pitch: -30,
            roll: 0
        }
    });

    // 更新轨迹时长
    const setTrackDuration = (duration: number) => {
        sceneConfig.value.trackDuration = duration;
    };

    // 更新位置更新频率
    const setUpdateFrequency = (frequency: number) => {
        sceneConfig.value.updateFrequency = frequency;
    };

    // 更新当前视角
    const updateCurrentView = (view: Partial<SceneConfig['currentView']>) => {
        sceneConfig.value.currentView = {
            ...sceneConfig.value.currentView,
            ...view
        };
    };

    // 重置视角到默认值
    const resetView = () => {
        sceneConfig.value.currentView = {
            longitude: 105,
            latitude: 30,
            height: 15000000,
            heading: 0,
            pitch: -30,
            roll: 0
        };
    };

    return {
        sceneConfig,
        setTrackDuration,
        setUpdateFrequency,
        updateCurrentView,
        resetView
    };
});