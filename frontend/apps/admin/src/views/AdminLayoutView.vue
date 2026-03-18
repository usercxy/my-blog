<script setup lang="ts">
import { computed } from "vue";
import { SwitchButton } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const menuItems = [
  {
    id: "01",
    label: "概览",
    path: "/dashboard",
    description: "站点状态与最新内容",
  },
  {
    id: "02",
    label: "文章管理",
    path: "/posts",
    description: "编辑与发布内容",
  },
  {
    id: "03",
    label: "项目管理",
    path: "/projects",
    description: "维护前台项目展示",
  },
  {
    id: "04",
    label: "分类管理",
    path: "/categories",
    description: "调整内容结构",
  },
  {
    id: "05",
    label: "标签管理",
    path: "/tags",
    description: "组织专题与关联阅读",
  },
  {
    id: "06",
    label: "站点设置",
    path: "/settings",
    description: "维护站点资料与 SEO",
  },
];

const currentSection = computed(
  () =>
    menuItems.find((item) => route.path.startsWith(item.path)) ?? menuItems[0],
);

const pageInfo = computed(() => {
  const meta = route.meta as {
    title?: string;
    description?: string;
  };

  return {
    title: meta.title ?? currentSection.value.label,
    description: meta.description ?? currentSection.value.description,
  };
});

const todayLabel = computed(() =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date()),
);

const logout = async () => {
  authStore.logout();
  await router.push("/login");
};
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar__brand-block">
        <div class="sidebar__brand">BLOG ADMIN</div>
      </div>

      <nav class="sidebar__nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="sidebar__link"
        >
          <span class="sidebar__link-index">{{ item.id }}</span>
          <span class="sidebar__link-copy">
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
          </span>
        </RouterLink>
      </nav>
    </aside>

    <main class="admin-content">
      <header class="admin-topbar">
        <div class="admin-topbar__main">
          <h1>{{ pageInfo.title }}</h1>
          <p>{{ pageInfo.description }}</p>
        </div>
        <div class="admin-topbar__side">
          <div class="admin-topbar__meta">
            <span class="admin-pill">{{ todayLabel }}</span>
            <span class="admin-pill admin-pill--accent">{{
              authStore.user?.name
            }}</span>
            <el-tooltip content="退出登录" placement="bottom">
              <button
                class="ghost-button icon-action-button"
                type="button"
                aria-label="退出登录"
                @click="logout"
              >
                <el-icon class="icon-action-button__icon">
                  <SwitchButton />
                </el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>
      </header>
      <section class="admin-panel">
        <RouterView />
      </section>
    </main>
  </div>
</template>
