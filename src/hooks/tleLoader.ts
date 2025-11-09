import { ref, onMounted, onUnmounted } from 'vue';
import type { SatelliteBase } from '@/types/core';

/**
 * TLE数据解析结果类型
 */
interface TLEParseResult {
  name: string;
  line1: string;
  line2: string;
}

/**
 * TLE数据加载钩子
 * 从public/2le.txt加载TLE数据并提供解析功能
 */
export const useTLELoader = () => {
  // TLE数据解析结果列表
  const tleData = ref<TLEParseResult[]>([]);
  // 加载状态
  const isLoading = ref(false);
  // 加载错误
  const error = ref<string | null>(null);
  // 是否已加载
  const isLoaded = ref(false);

  /**
   * 加载TLE数据文件
   */
  const loadTLEData = async () => {
    if (isLoading.value || isLoaded.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      // 从public文件夹加载2le.txt文件
      const response = await fetch('/2le.txt');
      
      if (!response.ok) {
        throw new Error(`Failed to load TLE data: ${response.status}`);
      }

      const text = await response.text();
      const parsedData = parseTLEData(text);
      tleData.value = parsedData;
      isLoaded.value = true;
      
      console.log(`Successfully loaded ${parsedData.length} satellite TLE data`);
    } catch (err) {
      console.error('Error loading TLE data:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 解析TLE文本数据
   * @param text TLE文件文本内容
   * @returns 解析后的TLE数据列表
   */
  const parseTLEData = (text: string): TLEParseResult[] => {
    const result: TLEParseResult[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // TLE格式：每3行表示一个卫星（名称、line1、line2）
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        // 检查是否符合TLE格式（粗略检查）
        const nameLine = (lines[i] || '').trim();
        const line1 = (lines[i + 1] || '').trim();
        const line2 = (lines[i + 2] || '').trim();
        
        // 基本格式验证：name不为空且line1以1开头，line2以2开头
        if (nameLine && line1.startsWith('1 ') && line2.startsWith('2 ')) {
          result.push({
            name: nameLine.replace(/^\d+\s*/, '').trim(), // 移除行首的数字和空格
            line1,
            line2
          });
        } else {
          console.warn(`Invalid TLE format at line ${i + 1}`);
          // 尝试跳过一行继续解析，处理可能的格式问题
          i -= 1;
        }
      }
    }
    
    return result;
  };

  /**
   * 根据索引获取卫星的TLE数据
   * @param index 索引（从0开始）
   * @returns TLE数据或null
   */
  const getTLEByIndex = (index: number): TLEParseResult | null => {
    if (index >= 0 && index < tleData.value.length && tleData.value[index]) {
      return tleData.value[index];
    }
    return null;
  };

  /**
   * 根据名称搜索卫星TLE数据
   * @param name 卫星名称（部分匹配）
   * @returns 匹配的TLE数据列表
   */
  const searchTLEByName = (name: string): TLEParseResult[] => {
    const lowerName = name.toLowerCase();
    return tleData.value.filter(
      tle => tle.name.toLowerCase().includes(lowerName)
    );
  };

  /**
   * 将TLE数据转换为SatelliteBase对象
   * @param index TLE数据索引
   * @returns SatelliteBase对象
   */
  const toSatelliteBase = (index: number): SatelliteBase => {
    const tle = getTLEByIndex(index);
    if (!tle) {
      throw new Error(`TLE data not found at index ${index}`);
    }

    return {
      id: index + 1, // 使用索引+1作为ID
      name: tle.name,
      line1: tle.line1,
      line2: tle.line2,
      status: 1, // 默认启用
      groups: [], // 默认无分组
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    };
  };

  /**
   * 获取所有卫星数据
   * @param limit 限制返回数量（默认全部）
   * @returns SatelliteBase数组
   */
  const getAllSatellites = (limit?: number): SatelliteBase[] => {
    const count = limit !== undefined ? Math.min(limit, tleData.value.length) : tleData.value.length;
    return Array.from({ length: count }, (_, i) => toSatelliteBase(i));
  };

  // 组件挂载时自动加载TLE数据
  onMounted(() => {
    loadTLEData();
  });

  return {
    tleData,
    isLoading,
    error,
    isLoaded,
    loadTLEData,
    getTLEByIndex,
    searchTLEByName,
    toSatelliteBase,
    getAllSatellites
  };
};
