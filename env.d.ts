/// <reference types="vite/client" />

// 关键：声明所有 .vue 文件的类型，让 TypeScript 识别 Vue 组件
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // 兼容所有 Vue 组件的类型（不限制 props/emits/插槽）
    const component: DefineComponent< 
        Record<string, unknown>, // props 类型
        Record<string, unknown>, // emits 类型
        unknown // 组件实例类型
    >
    export default component
}

// 可选：声明常用静态资源类型（避免导入图片/CSS 时报错，按需添加）
declare module '*.png' {
    const value: string
    export default value
}
declare module '*.jpg' {
    const value: string
    export default value
}
declare module '*.css'
declare module '*.scss'