// 分离类型导入与值导入（符合 verbatimModuleSyntax 要求）
import type {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosError,
    AxiosResponse
} from 'axios';
import axios from 'axios';

// 导入自定义响应类型
import type { ApiResponse } from '@/types/api';

// 接口基础路径（从环境变量获取，默认 '/api'）
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// 请求超时时间（默认 5 秒）
export const TIMEOUT = 5000;

// 创建 Axios 实例（类型标注正确）
const request: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器（参数类型为 InternalAxiosRequestConfig，兼容 Axios v1.x+）
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 示例：添加认证 token（确保 headers 非空判断）
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 响应拦截器（明确 ApiResponse 的泛型参数，增强类型安全性）
request.interceptors.response.use(
    <T = any>(response: AxiosResponse<ApiResponse<T>>) => {
        const res = response.data;
        // 非成功状态码（如 400、500）视为错误
        if (res.code !== 200) {
            console.error('API Error:', res.message);
            return Promise.reject(new Error(res.message || '接口请求失败'));
        }
        // 返回业务数据（ApiResponse.data），自动推导类型为 T
        return res.data;
    },
    (error: AxiosError) => {
        console.error('Network Error:', error.message);
        return Promise.reject(error);
    }
);

// 命名导出，供其他文件导入使用
export { request };