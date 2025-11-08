import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 全局应用状态类型定义
interface AppState {
    loading: boolean;
    notification: {
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        visible: boolean;
    };
    userConfig: {
        theme: 'light' | 'dark';
        language: 'zh-CN' | 'en-US';
    };
}

export const useAppStore = defineStore('app', () => {
    // 全局应用状态
    const appState = ref<AppState>({
        loading: false,
        notification: {
            message: '',
            type: 'info',
            visible: false
        },
        userConfig: {
            theme: 'light',
            language: 'zh-CN'
        }
    });

    // 设置加载状态
    const setLoading = (loading: boolean) => {
        appState.value.loading = loading;
    };

    // 显示通知
    const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
        appState.value.notification = {
            message,
            type,
            visible: true
        };
        // 3秒后自动隐藏
        setTimeout(() => {
            appState.value.notification.visible = false;
        }, 3000);
    };

    // 切换主题
    const toggleTheme = () => {
        appState.value.userConfig.theme =
            appState.value.userConfig.theme === 'light' ? 'dark' : 'light';
    };

    // 设置语言
    const setLanguage = (language: 'zh-CN' | 'en-US') => {
        appState.value.userConfig.language = language;
    };

    return {
        appState,
        setLoading,
        showNotification,
        toggleTheme,
        setLanguage
    };
});