import { ref, computed, watch, onUnmounted } from 'vue';
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
    duration = 3600,
    interval = 10
) => {
    // 轨迹点列表（按时间排序）
    const trackPoints = ref<{ position: Cesium.Cartesian3; time: Cesium.JulianDate }[]>([]);
    // 轨迹实体（Cesium 线实体）
    const trackEntity = ref<Cesium.Entity | null>(null);
    // 是否显示轨迹
    const isTrackVisible = ref(true);
    // 轨迹颜色
    const trackColor = ref<Cesium.Color>(Cesium.Color.fromCssColorString('#00ffff'));

    // 初始化轨迹实体
    const initTrackEntity = () => {
        if (trackEntity.value) return;

        trackEntity.value = new Cesium.Entity({
            polyline: {
                positions: new Cesium.ConstantPositionProperty([]),
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
        if (trackEntity.value) {
            const positions = trackPoints.value.map(point => point.position);
            (trackEntity.value.polyline as Cesium.PolylineGraphics).positions =
                new Cesium.ConstantPositionProperty(positions);
        }
    };

    // 清空轨迹
    const clearTrack = () => {
        trackPoints.value = [];
        if (trackEntity.value) {
            (trackEntity.value.polyline as Cesium.PolylineGraphics).positions =
                new Cesium.ConstantPositionProperty([]);
        }
    };

    // 监听位置属性变化，初始化轨迹
    watch(() => positionProperty, (newProp) => {
        if (newProp) {
            initTrackEntity();
            // 初始添加一个点 + 定时采样
            addTrackPoint();
            const sampleTimer = setInterval(addTrackPoint, interval * 1000);
            onUnmounted(() => clearInterval(sampleTimer));
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
            ((trackEntity.value.polyline as Cesium.PolylineGraphics).material as Cesium.PolylineGlowMaterialProperty).color = color;
        }
    });

    // 销毁时清理轨迹实体
    onUnmounted(() => {
        if (trackEntity.value && trackEntity.value.polyline) {
            ((trackEntity.value.polyline as Cesium.PolylineGraphics).material as Cesium.PolylineGlowMaterialProperty).destroy();
        }
        if (trackEntity.value) {
            trackEntity.value.destroy();
        }
    });

    return {
        trackPoints,
        trackEntity,
        isTrackVisible,
        trackColor,
        clearTrack,
        addTrackPoint, // 手动添加轨迹点
        setTrackDuration: (newDuration: number) => duration = newDuration, // 修改轨迹保留时长
        setTrackInterval: (newInterval: number) => interval = newInterval // 修改采样间隔
    };
};