# Personal Blog Frontend

基于《个人博客前端技术文档-Vue3》搭建的个人博客前端 monorepo。

当前仓库已经不是单纯脚手架，而是一个可运行的 MVP demo：

- 前台使用 `Nuxt 3 + Vue 3 + Pinia`
- 后台使用 `Vue 3 + Vite + Element Plus + Pinia`
- 共享层提供文章、分类、标签、项目、站点设置、管理员信息等 mock 数据与类型
- 目前以本地 mock 数据驱动，暂未接入真实后端 API

## 目录结构

```text
frontend/
├─ apps/
│  ├─ web/                         # Nuxt 3 博客前台
│  └─ admin/                       # Vue 3 + Vite 管理后台
├─ packages/
│  ├─ shared-types/                # 前后台共享类型
│  ├─ shared-utils/                # mock 数据、查询方法、格式化工具
│  └─ ui/                          # 共享 UI 包占位
├─ package.json                    # workspace 根配置
├─ package-lock.json
└─ README.md
```

## 当前已实现

### 前台 `apps/web`

- 首页：品牌区、精选文章、最新更新、分类导航、项目展示
- 文章列表页：关键词搜索、分类筛选
- 文章详情页：文章元信息、章节内容、目录、上一篇/下一篇、相关推荐
- 分类页、标签页、归档页
- 搜索页
- 关于页
- 项目列表页、项目详情页

### 后台 `apps/admin`

- 登录页
- 登录态 store 与路由守卫
- 概览
- 文章管理列表
- 文章新建/编辑页
- 分类管理
- 标签管理
- 站点设置

## 技术说明

- 数据来源：当前全部使用 `packages/shared-utils/src/mock-data.ts`
- 共享类型：`packages/shared-types/src/index.ts`
- 前台内容 store：`apps/web/stores/content.ts`
- 后台内容管理 store：`apps/admin/src/stores/cms.ts`
- 后台登录 store：`apps/admin/src/stores/auth.ts`

## 安装依赖

在 `frontend` 目录下执行：

```bash
npm install
```

如果你在 PowerShell 中遇到 `npm.ps1` 执行策略问题，可以改用：

```bash
npm.cmd install
```

## 本地启动

### 启动前台

```bash
cd frontend
npm run dev:web
```

### 启动后台

```bash
cd frontend
npm run dev:admin
```

默认情况下：

- 前台优先使用 `http://localhost:3000`
- 后台优先使用 `http://localhost:5173`

如果端口已被占用，Nuxt 或 Vite 会自动切换到其他可用端口。

## 后台 demo 账号

当前后台登录使用本地 mock 鉴权，默认账号：

- 用户名：`admin`
- 密码：`demo123`

## 构建命令

### 构建前台

```bash
npm run build:web
```

### 构建后台

```bash
npm run build:admin
```

## 已完成验证

当前项目已经完成以下校验：

- `npm install`
- `npm run build:web`
- `npm run build:admin`
- 前台 dev 服务可正常返回页面
- 后台 dev 服务可正常返回入口页面

## 下一步建议

后续可以按文档继续推进这些能力：

- 对接真实后端 API
- 引入 Markdown 渲染与代码高亮
- 增强 SEO 能力，如 sitemap、结构化数据、meta 策略
- 完善后台表单校验、保存提示和内容预览
- 补充测试：Vitest、Vue Test Utils、Playwright
