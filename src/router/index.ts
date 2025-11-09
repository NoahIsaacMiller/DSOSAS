import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layout/MainLayout.vue';
import SatelliteList from '@/components/satellite/SatelliteList.vue';
import GroupList from '@/components/common/GroupList.vue';
import SceneView from '@/views/SceneView.vue';
import NotFound from '@/views/NotFound.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/3d' },
      { path: '3d', name: '3D 可视化', component: SceneView },
      { path: 'satellites', name: '卫星列表', component: SatelliteList },
      { path: 'groups', name: '分组管理', component: GroupList }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;