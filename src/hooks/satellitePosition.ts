import { ref, watch } from 'vue';

/**
 * 简化的轨道传播器，使用SGP4简化算法计算卫星位置
 */
export class SimplifiedOrbitPropagator {
  private tle1: string;
  private tle2: string;
  private mu = 398600.4418; // 地球引力常数 (km^3/s^2)
  private re = 6378.137;   // 地球赤道半径 (km)
  
  constructor(tle1: string, tle2: string) {
    this.tle1 = tle1;
    this.tle2 = tle2;
  }
  
  /**
   * 从TLE数据中提取轨道参数
   */
  private extractOrbitalElements() {
    // 简化的TLE解析，提取基本轨道参数
    const inclination = parseFloat(this.tle2.substring(8, 16));
    const rightAscension = parseFloat(this.tle2.substring(17, 25));
    const eccentricity = parseFloat('0.' + this.tle2.substring(26, 33));
    const argumentOfPerigee = parseFloat(this.tle2.substring(34, 42));
    const meanAnomaly = parseFloat(this.tle2.substring(43, 51));
    const meanMotion = parseFloat(this.tle2.substring(52, 63));
    
    return {
      inclination: (inclination * Math.PI) / 180, // 转换为弧度
      rightAscension: (rightAscension * Math.PI) / 180,
      eccentricity,
      argumentOfPerigee: (argumentOfPerigee * Math.PI) / 180,
      meanAnomaly: (meanAnomaly * Math.PI) / 180,
      meanMotion: meanMotion * 2 * Math.PI / 86400 // 转换为弧度/秒
    };
  }
  
  /**
   * 计算给定时间的卫星位置
   * @param time 时间（秒）相对于历元时刻
   * @returns 卫星位置对象 {x, y, z}（地心惯性坐标系，单位：米）
   */
  public calculatePosition(time: number) {
    try {
      const elements = this.extractOrbitalElements();
      
      // 计算平近点角随时间的变化
      const M = elements.meanAnomaly + elements.meanMotion * time;
      
      // 使用牛顿迭代法求解偏近点角
      let E = M;
      for (let i = 0; i < 10; i++) {
        const delta = (E - elements.eccentricity * Math.sin(E) - M) / 
                     (1 - elements.eccentricity * Math.cos(E));
        E -= delta;
        if (Math.abs(delta) < 1e-12) break;
      }
      
      // 计算真近点角
      const nu = 2 * Math.atan(
        Math.sqrt((1 + elements.eccentricity) / (1 - elements.eccentricity)) * 
        Math.tan(E / 2)
      );
      
      // 计算半长轴
      const a = Math.pow(this.mu / Math.pow(elements.meanMotion, 2), 1/3);
      
      // 计算轨道半径
      const r = a * (1 - elements.eccentricity * Math.cos(E));
      
      // 计算轨道平面内坐标
      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      const zOrb = 0;
      
      // 转换到地心惯性坐标系
      // 1. 绕x轴旋转-倾角
      const x1 = xOrb;
      const y1 = yOrb * Math.cos(elements.inclination) - zOrb * Math.sin(elements.inclination);
      const z1 = yOrb * Math.sin(elements.inclination) + zOrb * Math.cos(elements.inclination);
      
      // 2. 绕z轴旋转-近地点幅角
      const x2 = x1 * Math.cos(elements.argumentOfPerigee) - y1 * Math.sin(elements.argumentOfPerigee);
      const y2 = x1 * Math.sin(elements.argumentOfPerigee) + y1 * Math.cos(elements.argumentOfPerigee);
      const z2 = z1;
      
      // 3. 绕z轴旋转-升交点赤经
      const x3 = x2 * Math.cos(elements.rightAscension) - y2 * Math.sin(elements.rightAscension);
      const y3 = x2 * Math.sin(elements.rightAscension) + y2 * Math.cos(elements.rightAscension);
      const z3 = z2;
      
      // 返回结果（转换为米）
      return {
        x: x3 * 1000,
        y: y3 * 1000,
        z: z3 * 1000
      };
    } catch (error) {
      console.error('轨道计算错误:', error);
      // 发生错误时返回默认位置
      return {
        x: 6378137,
        y: 0,
        z: 0
      };
    }
  }
}

/**
 * 创建卫星位置跟踪器
 * @param tle1 TLE第一行
 * @param tle2 TLE第二行
 * @returns 卫星位置跟踪器
 */
export function createSatellitePositionTracker(tle1: string, tle2: string) {
  const propagator = new SimplifiedOrbitPropagator(tle1, tle2);
  const position = ref({ x: 0, y: 0, z: 0 });
  const timeOffset = ref<number>(0); // 相对于历元的时间偏移（秒）
  
  // 更新位置函数
  const updatePosition = () => {
    position.value = propagator.calculatePosition(timeOffset.value);
  };
  
  // 监听时间偏移变化
  watch(timeOffset, () => {
    updatePosition();
  });
  
  // 初始化位置
  updatePosition();
  
  return {
    position,
    timeOffset,
    updatePosition
  };
}

/**
 * 创建增强版的卫星位置跟踪器，支持实时更新
 * @param tle1 TLE第一行
 * @param tle2 TLE第二行
 * @returns 增强版卫星位置跟踪器
 */
export const createEnhancedSatelliteTracker = (tle1: string, tle2: string) => {
  // 当前位置
  const currentPosition = ref({ x: 0, y: 0, z: 0 });
  // 当前速度
  const currentVelocity = ref({ x: 0, y: 0, z: 0 });
  // 是否有效
  const isValid = ref(false);
  // 错误信息
  const errorMessage = ref('');
  // 定时器引用
  let positionUpdateTimer: number | null = null;
  
  // 初始化函数
  const init = () => {
    // 清理之前可能存在的定时器
    if (positionUpdateTimer !== null) {
      clearInterval(positionUpdateTimer);
      positionUpdateTimer = null;
    }

    if (!tle1 || !tle2) {
      errorMessage.value = 'TLE 数据不完整';
      isValid.value = false;
      return;
    }

    try {
      // 创建轨道传播器
      const propagator = new SimplifiedOrbitPropagator(tle1, tle2);
      
      // 更新位置的函数
      const updatePosition = () => {
        try {
          // 使用当前时间作为偏移量
          const now = Date.now();
          const timeInSeconds = now / 1000; // 转换为秒
          
          // 计算当前位置
          const position = propagator.calculatePosition(timeInSeconds);
          currentPosition.value = position;
          
          // 计算速度（使用微小时间差）
          const nextPosition = propagator.calculatePosition(timeInSeconds + 0.1);
          currentVelocity.value = {
              x: (nextPosition.x - position.x) / 0.1,
              y: (nextPosition.y - position.y) / 0.1,
              z: (nextPosition.z - position.z) / 0.1
          };
        } catch (error) {
          console.error('更新位置时出错:', error);
        }
      };
      
      isValid.value = true;
      errorMessage.value = '';

      // 初始更新 + 定时更新
      updatePosition();
      positionUpdateTimer = setInterval(updatePosition, 100) as unknown as number;
    } catch (err) {
      errorMessage.value = 'TLE 数据解析失败';
      isValid.value = false;
      console.error('TLE 解析错误:', err);
    }
  };

  // 清理资源和定时器
  const cleanup = () => {
    if (positionUpdateTimer !== null) {
      clearInterval(positionUpdateTimer);
      positionUpdateTimer = null;
    }
    currentPosition.value = { x: 0, y: 0, z: 0 };
    currentVelocity.value = { x: 0, y: 0, z: 0 };
  };

  // 更新TLE数据
  const updateTle = (newTle1: string, newTle2: string) => {
    tle1 = newTle1;
    tle2 = newTle2;
    init();
  };

  // 初始化
  init();

  return {
    currentPosition,
    currentVelocity,
    isValid,
    errorMessage,
    refreshPosition: init,
    updateTle,
    cleanup
  };
};

// 保持向后兼容的useSatellitePosition函数
export const useSatellitePosition = (tle1: string, tle2: string) => {
  // 创建增强版位置追踪器
  const tracker = createEnhancedSatelliteTracker(tle1, tle2);
  
  // 监听TLE数据变化
  watch([() => tle1, () => tle2], ([newTle1, newTle2]) => {
    tracker.updateTle(newTle1, newTle2);
  });
  
  return tracker;
};