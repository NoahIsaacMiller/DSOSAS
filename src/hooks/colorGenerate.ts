import { computed } from 'vue';
import * as Cesium from 'cesium';

/**
 * 颜色生成钩子
 * 基于字符串（名称/ID）哈希生成固定颜色，支持 Cesium 和 CSS 颜色格式
 * @param key 生成颜色的关键字（如卫星名称、ID）
 * @param saturation 饱和度（0-1），默认 0.8
 * @param lightness 亮度（0-1），默认 0.5
 * @returns 生成的颜色（Cesium 格式 + CSS 格式）
 */
export const useColorGenerate = (
    key: string | number,
    saturation = 0.8,
    lightness = 0.5
) => {
    // 字符串哈希函数（将字符串转为 0-1 之间的数值）
    const stringToHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        return hash / 0x7fffffff; // 归一化到 0-1
    };

    // 基于关键字生成 HSL 颜色，再转为目标格式
    const generateColor = () => {
        const keyStr = String(key);
        const hue = stringToHash(keyStr) * 360; // 色相 0-360

        // HSL 转 RGB（用于 CSS 颜色）
        const hslToRgb = (h: number, s: number, l: number) => {
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // 灰度
            } else {
                const hue2rgb = (p: number, q: number, t: number) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h / 360 + 1 / 3);
                g = hue2rgb(p, q, h / 360);
                b = hue2rgb(p, q, h / 360 - 1 / 3);
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        };

        const rgb = hslToRgb(hue, saturation, lightness);
        const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const cesiumColor = new Cesium.Color(
            rgb.r / 255,
            rgb.g / 255,
            rgb.b / 255,
            1.0
        );

        return { cssColor, cesiumColor };
    };

    // 计算属性：颜色生成结果（关键字变化时自动重新生成）
    const colorResult = computed(() => generateColor());

    // 暴露 Cesium 颜色和 CSS 颜色
    const cesiumColor = computed(() => colorResult.value.cesiumColor);
    const cssColor = computed(() => colorResult.value.cssColor);

    // 手动生成新颜色（可调整饱和度和亮度）
    const regenerateColor = (newSaturation?: number, newLightness?: number) => {
        return generateColor();
    };

    return {
        cesiumColor,
        cssColor,
        regenerateColor
    };
};