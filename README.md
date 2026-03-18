# Personal Blog

这是一个个人博客全栈项目，当前仓库包含：

- `frontend`：博客前台与管理后台前端
- `backend`：博客后端 API 与数据库迁移
- 项目需求与技术文档
- 方案 A 部署手册

当前技术栈概览：

- 前台：Nuxt 3 + Vue 3 + Pinia
- 管理后台：Vue 3 + Vite + Element Plus + Pinia
- 后端：NestJS + Prisma + PostgreSQL

## 仓库结构

```text
.
├─ frontend/                          # 前端 monorepo
│  ├─ apps/
│  │  ├─ web/                         # Nuxt 3 博客前台
│  │  └─ admin/                       # Vue 3 + Vite 管理后台
│  └─ packages/                       # 共享类型、工具、UI
├─ backend/                           # NestJS + Prisma 后端
├─ Deployment-Plan-A.md               # 方案 A 部署手册
├─ PersonalBlogRequirements.md        # 需求文档
├─ 个人博客前端技术文档-Vue3.md
└─ 个人博客后端技术文档-Nodejs.md
```

## 当前状态

这个仓库已经不是单纯的脚手架，当前包含：

- 可运行的博客前台
- 可运行的管理后台
- 可启动的 NestJS 后端
- Prisma schema、迁移与 seed 脚本
- 一套可执行的部署方案文档

## 本地开发

### 前端

前端位于 [frontend](/D:/AI/Blog/frontend)，包含博客前台与管理后台。

安装依赖：

```bash
cd frontend
npm install
```

启动博客前台：

```bash
npm run dev:web
```

启动管理后台：

```bash
npm run dev:admin
```

### 后端

后端位于 [backend](/D:/AI/Blog/backend)。

安装依赖：

```bash
cd backend
npm install
```

准备环境变量：

```bash
copy .env.example .env
```

生成 Prisma Client、执行迁移并写入演示数据：

```bash
npm run prisma:generate
npx prisma migrate dev --name init
npm run db:seed
```

启动后端：

```bash
npm run start:dev
```

## 关键文档

- 需求文档：[PersonalBlogRequirements.md](/D:/AI/Blog/PersonalBlogRequirements.md)
- 前端技术文档：[个人博客前端技术文档-Vue3.md](/D:/AI/Blog/个人博客前端技术文档-Vue3.md)
- 后端技术文档：[个人博客后端技术文档-Nodejs.md](/D:/AI/Blog/个人博客后端技术文档-Nodejs.md)
- 方案 A 部署手册：[Deployment-Plan-A.md](/D:/AI/Blog/Deployment-Plan-A.md)

## 上传 GitHub 前注意事项

- 不要提交任何真实的 `.env` 文件
- 不要提交 `node_modules`、构建产物或本地缓存目录
- 当前根目录 `.gitignore` 已覆盖常见误提交项
- 如果准备公开仓库，建议补一个适合你的 `LICENSE`

## 推荐部署方案

当前最推荐的部署方式是：

- GitHub：源码托管
- Vercel：博客前台和管理后台
- Railway：后端与 PostgreSQL

详细步骤见 [Deployment-Plan-A.md](/D:/AI/Blog/Deployment-Plan-A.md)。
