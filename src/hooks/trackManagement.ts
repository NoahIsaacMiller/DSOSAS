import { ref, watch, onUnmounted } from 'vue';
import * as Cesium from 'cesium';

/**
 * 轨迹管理钩子
 * @param positionProperty 卫星位置属性（来自 useSatellitePosition）
 * @param duration 轨迹保留时长（秒），默认 3600 秒（1 小时）
 * @param interval 轨迹点采样间隔（秒），默认 10 秒
 * @returns 轨迹点列表、轨迹实体等管理工具
 */
export const useTrackManagement = (
    positionProperty: Cesium.SampledPositionProperty | null,
    initialDuration = 3600,
    initialInterval = 10
) => {
    // 使用响应式变量存储配置
    let duration = initialDuration;
    let interval = initialInterval;
    // 轨迹点列表（按时间排序）
    const trackPoints = ref<{ position: Cesium.Cartesian3; time: Cesium.JulianDate }[]>([]);
    // 轨迹实体（Cesium 线实体）
    const trackEntity = ref<Cesium.Entity | null>(null);
    // 是否显示轨迹
    const isTrackVisible = ref(true);
    // 轨迹颜色
    const trackColor = ref<Cesium.Property>(new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#00ffff')));
    // 采样定时器引用（用于防止内存泄漏）
    const sampleTimerRef = ref<number | null>(null);

    // 初始化轨迹实体
    const initTrackEntity = () => {
        if (trackEntity.value) return;

        trackEntity.value = new Cesium.Entity({
            polyline: {
                positions: new Cesium.ConstantProperty([]),
                width: 2,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.3,
                    color: trackColor.value
                }),
                show: isTrackVisible.value
            }
        });
    };

    // 添加轨迹点
    const addTrackPoint = () => {
        if (!positionProperty) return;

        const now = Cesium.JulianDate.now();
        const position = positionProperty.getValue(now);
        if (!position) return;

        // 添加新轨迹点
        trackPoints.value.push({ position, time: now });
        // 移除过期轨迹点
        const expireTime = Cesium.JulianDate.addSeconds(now, -duration, new Cesium.JulianDate());
        trackPoints.value = trackPoints.value.filter(point =>
            Cesium.JulianDate.compare(point.time, expireTime) >= 0
        );

        // 更新轨迹实体的位置列表
        if (trackEntity.value && trackEntity.value.polyline) {
            try {
                const positions = trackPoints.value.map(point => point.position);
                (trackEntity.value.polyline as Cesium.PolylineGraphics).positions =
                    new Cesium.ConstantProperty(positions);
            } catch (error) {
                console.warn('Failed to update track positions:', error);
            }
        }
    };

    // 清空轨迹
    const clearTrack = () => {
        trackPoints.value = [];
        if (trackEntity.value && trackEntity.value.polyline) {
            try {
                (trackEntity.value.polyline as Cesium.PolylineGraphics).positions =
                    new Cesium.ConstantProperty([]);
            } catch (error) {
                console.warn('Failed to clear track positions:', error);
            }
        }
    };

    // 监听位置属性变化，初始化轨迹
    watch(() => positionProperty, (newProp) => {
        // 清理旧的定时器，防止内存泄漏
        if (sampleTimerRef.value) {
            clearInterval(sampleTimerRef.value);
            sampleTimerRef.value = null;
        }

        if (newProp) {
            initTrackEntity();
            // 初始添加一个点 + 定时采样
            addTrackPoint();
            sampleTimerRef.value = window.setInterval(addTrackPoint, interval * 1000);
        } else {
            clearTrack();
        }
    }, { immediate: true });

    // 监听显示状态变化
    watch(isTrackVisible, (visible) => {
        if (trackEntity.value) {
            trackEntity.value.show = visible;
        }
    });

    // 监听颜色变化
    watch(trackColor, (color) => {
        if (trackEntity.value) {
            const material = (trackEntity.value.polyline as Cesium.PolylineGraphics).material as Cesium.PolylineGlowMaterialProperty;
            if (material) {
                material.color = color;
            }
        }
    });

    // 销毁时清理轨迹实体和定时器
    onUnmounted(() => {
        // 清理定时器
        if (sampleTimerRef.value) {
            clearInterval(sampleTimerRef.value);
            sampleTimerRef.value = null;
        }

        // 清理 Cesium 资源
        // 注意：Cesium 中并非所有对象都有 destroy 方法，根据实际情况处理
        if (trackEntity.value) {
            // 移除实体但不调用 destroy 方法，避免类型错误
            trackEntity.value.show = false;
            // 如果实体已添加到数据提供者，应该从那里移除
        }

        // 清空轨迹点数组
        trackPoints.value = [];
    });

    // 修改轨迹保留时长
    const setTrackDuration = (newDuration: number) => {
        if (newDuration > 0) {
            duration = newDuration;
            // 立即应用新的时长，移除过期点
            const now = Cesium.JulianDate.now();
            const expireTime = Cesium.JulianDate.addSeconds(now, -duration, new Cesium.JulianDate());
            trackPoints.value = trackPoints.value.filter(point =>
                Cesium.JulianDate.compare(point.time, expireTime) >= 0
            );
            // 更新轨迹显示
            if (trackEntity.value && trackEntity.value.polyline) {
                try {
                    const positions = trackPoints.value.map(point => point.position);
                    (trackEntity.value.polyline as Cesium.PolylineGraphics).positions =
                        new Cesium.ConstantProperty(positions);
                } catch (error) {
                    console.warn('Failed to update track after duration change:', error);
                }
            }
        }
    };

    // 修改采样间隔
    const setTrackInterval = (newInterval: number) => {
        if (newInterval > 0 && positionProperty) {
            interval = newInterval;
            // 重新设置定时器以应用新的间隔
            if (sampleTimerRef.value) {
                clearInterval(sampleTimerRef.value);
            }
            sampleTimerRef.value = window.setInterval(addTrackPoint, interval * 1000);
        }
    };

    return {
        trackPoints,
        trackEntity,
        isTrackVisible,
        trackColor,
        clearTrack,
        addTrackPoint, // 手动添加轨迹点
        setTrackDuration, // 修改轨迹保留时长
        setTrackInterval // 修改采样间隔
    };
};