import { ref, watch, onUnmounted } from 'vue';
import * as Cesium from 'cesium';

/**
 * 卫星位置计算钩子
 * @param tle1 TLE 第一行数据
 * @param tle2 TLE 第二行数据
 * @returns 卫星位置、速度、是否有效等状态
 */
export const useSatellitePosition = (tle1: string, tle2: string) => {
    // 位置属性（Cesium 专用）
    const positionProperty = ref<Cesium.SatellitePositionProperty | null>(null);
    // 当前位置
    const currentPosition = ref<Cesium.Cartesian3 | null>(null);
    // 当前速度
    const currentVelocity = ref<Cesium.Cartesian3 | null>(null);
    // 是否有效（TLE 解析成功）
    const isValid = ref(false);
    // 错误信息
    const errorMessage = ref('');

    // 初始化 TLE 解析
    const initPositionProperty = () => {
        if (!tle1 || !tle2) {
            errorMessage.value = 'TLE 数据不完整';
            isValid.value = false;
            return;
        }

        try {
            // 解析 TLE 数据创建位置属性
            const tleData = { tle1, tle2, name: 'satellite' };
            positionProperty.value = new Cesium.SatellitePositionProperty(tleData);
            isValid.value = true;
            errorMessage.value = '';

            // 监听位置变化，更新当前位置和速度
            const updatePosition = () => {
                if (!positionProperty.value) return;
                const now = Cesium.JulianDate.now();
                currentPosition.value = positionProperty.value.getValue(now);

                // 计算速度（前后 1 秒位置差）
                const nextTime = Cesium.JulianDate.addSeconds(now, 1, new Cesium.JulianDate());
                const nextPosition = positionProperty.value.getValue(nextTime);
                if (currentPosition.value && nextPosition) {
                    currentVelocity.value = Cesium.Cartesian3.subtract(
                        nextPosition,
                        currentPosition.value,
                        new Cesium.Cartesian3()
                    );
                }
            };

            // 初始更新 + 定时更新（100ms 一次）
            updatePosition();
            const timer = setInterval(updatePosition, 100);
            onUnmounted(() => clearInterval(timer));
        } catch (err) {
            errorMessage.value = 'TLE 数据解析失败';
            isValid.value = false;
            console.error('TLE 解析错误:', err);
        }
    };

    // 监听 TLE 数据变化，重新初始化
    watch([() => tle1, () => tle2], initPositionProperty, { immediate: true });

    // 销毁时清理资源
    onUnmounted(() => {
        if (positionProperty.value) {
            positionProperty.value.destroy();
        }
    });

    return {
        positionProperty,
        currentPosition,
        currentVelocity,
        isValid,
        errorMessage,
        refreshPosition: initPositionProperty // 手动刷新位置的方法
    };
};