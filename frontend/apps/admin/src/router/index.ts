import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import pinia from '../stores/pinia'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    component: () => import('../views/AdminLayoutView.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: {
          title: '概览',
          description: '展示当前内容规模、草稿情况和最近更新，便于快速掌握站点状态。',
        },
      },
      {
        path: '/posts',
        name: 'posts',
        component: () => import('../views/PostsView.vue'),
        meta: {
          title: '文章管理',
          description: '支持按关键词和状态筛选，并进入创建或编辑流程。',
        },
      },
      {
        path: '/projects',
        name: 'projects',
        component: () => import('../views/ProjectsView.vue'),
        meta: {
          title: '项目管理',
          description: '支持维护前台项目列表的标题、摘要、正文、链接、状态和展示顺序。',
        },
      },
      {
        path: '/projects/create',
        name: 'project-create',
        component: () => import('../views/ProjectEditorView.vue'),
        meta: {
          title: '新建项目',
          description: '这里维护的项目内容会直接影响前台 `/projects` 列表与详情页展示。',
        },
      },
      {
        path: '/projects/:id/edit',
        name: 'project-edit',
        component: () => import('../views/ProjectEditorView.vue'),
        meta: {
          title: '编辑项目',
          description: '这里维护的项目内容会直接影响前台 `/projects` 列表与详情页展示。',
        },
      },
      {
        path: '/posts/create',
        name: 'post-create',
        component: () => import('../views/PostEditorView.vue'),
        meta: {
          title: '新建文章',
          description: '当前编辑器已经接入真实接口，保存后会直接写入后端数据库。',
        },
      },
      {
        path: '/posts/:id/edit',
        name: 'post-edit',
        component: () => import('../views/PostEditorView.vue'),
        meta: {
          title: '编辑文章',
          description: '当前编辑器已经接入真实接口，保存后会直接写入后端数据库。',
        },
      },
      {
        path: '/categories',
        name: 'categories',
        component: () => import('../views/CategoriesView.vue'),
        meta: {
          title: '分类管理',
          description: '维护博客的一级结构，为文章归类提供清晰入口。',
        },
      },
      {
        path: '/tags',
        name: 'tags',
        component: () => import('../views/TagsView.vue'),
        meta: {
          title: '标签管理',
          description: '标签负责横向连接主题，适合做专题和相关推荐。',
        },
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: {
          title: '站点设置',
          description: '当前直接维护后端中的站点基础信息、SEO 文案和关于页内容。',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  authStore.restoreSession()

  if (to.name === 'login' && authStore.isLoggedIn) {
    return '/dashboard'
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
})

export default router
