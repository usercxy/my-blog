# 方案 A 部署手册

## 部署目标

方案 A 采用这套组合：

- GitHub：源码托管
- Vercel：博客前台 `frontend/apps/web`
- Vercel：管理后台 `frontend/apps/admin`
- Railway：后端 `backend`
- Railway PostgreSQL：数据库

按当前项目结构，这套方案最适合现有技术栈：

- `Nuxt 3` 前台适合放 Vercel
- `Vite` 后台适合放 Vercel
- `NestJS + Prisma + PostgreSQL` 适合放 Railway
- 前台已经支持通过环境变量切换 API 地址，见 [api.ts](/D:/AI/Blog/frontend/apps/web/services/api.ts)
- 后端已经有明确的环境变量校验，见 [env.validation.ts](/D:/AI/Blog/backend/src/config/env.validation.ts)

## 一、上线前准备

先确认以下基础条件：

- 前端要求 Node `>=22`，见 [frontend/package.json](/D:/AI/Blog/frontend/package.json)
- 后端要求 Node `>=20`，见 [backend/package.json](/D:/AI/Blog/backend/package.json)
- 后端生产环境必须配置：
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CORS_ORIGIN`
- 默认本地 API 地址是 `http://localhost:8000/api`，生产必须改掉，见 [nuxt.config.ts](/D:/AI/Blog/frontend/apps/web/nuxt.config.ts)

建议统一使用：

- Node 22
- npm 10+
- 一个 GitHub 仓库，根目录就是 `D:\AI\Blog`

## 二、整理仓库并推到 GitHub

当前目录还不是 Git 仓库根目录，正式部署前，先把仓库整理好。

建议在根目录增加一个 `.gitignore`，至少包含这些内容：

```gitignore
# dependencies
node_modules
frontend/node_modules
backend/node_modules

# build outputs
dist
backend/dist
frontend/apps/web/.nuxt
frontend/apps/web/.output
frontend/apps/admin/dist
frontend/.vite

# env
.env
.env.local
backend/.env
backend/.env.local
frontend/.env
frontend/.env.local

# logs
*.log

# misc
coverage
.DS_Store
```

然后初始化 Git 并推送：

```bash
cd D:\AI\Blog
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

注意：

- 不要把 [backend/.env](/D:/AI/Blog/backend/.env) 提交上去
- 可以保留 [backend/.env.example](/D:/AI/Blog/backend/.env.example) 作为模板
- 建议补一个仓库根级 `README.md` 和 `LICENSE`

## 三、准备生产环境变量

先统一规划生产域名，推荐这样：

- 博客前台：`https://www.yourdomain.com`
- 管理后台：`https://admin.yourdomain.com`
- 后端 API：`https://api.yourdomain.com`

如果暂时不用自定义域名，也可以先用平台默认域名。

### 后端 `backend`

需要准备以下环境变量：

```env
NODE_ENV=production
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=<Railway Postgres 连接串>
CORS_ORIGIN=<前台域名>,<后台域名>
JWT_ACCESS_SECRET=<强随机字符串>
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=<强随机字符串>
JWT_REFRESH_EXPIRES_IN=7d
```

### 前台博客 `frontend/apps/web`

需要设置：

```env
NUXT_PUBLIC_API_BASE_URL=https://你的后端域名/api
```

### 管理后台 `frontend/apps/admin`

如果后台也通过环境变量请求 API，建议统一补一个：

```env
VITE_API_BASE_URL=https://你的后端域名/api
```

如果后台目前还没有这类环境变量入口，后续最好补上，这样切换环境更稳。

### 生成随机密钥

可以本地执行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 四、部署数据库到 Railway

1. 登录 Railway
2. 新建项目
3. 添加 PostgreSQL
4. 进入数据库服务，拿到连接串
5. 记下 `DATABASE_URL`

如果想先导入当前本地数据：

- 先在本地确认 Prisma migration 正常
- 再把生产库跑一次迁移
- 最后按需执行 seed

Prisma 相关文件在：

- [schema.prisma](/D:/AI/Blog/backend/prisma/schema.prisma)
- [seed.ts](/D:/AI/Blog/backend/prisma/seed.ts)

## 五、部署后端到 Railway

在 Railway 里再新建一个 Node 服务，来源选择你的 GitHub 仓库。

服务配置建议：

- Root Directory: `backend`

构建和启动逻辑要覆盖这几步：

- 安装依赖
- `prisma generate`
- 构建 NestJS
- 启动生产服务

当前脚本见 [backend/package.json](/D:/AI/Blog/backend/package.json)。

推荐构建命令：

```bash
npm install
npm run prisma:generate
npm run build
```

推荐启动命令：

```bash
npm run start
```

更关键的是迁移。生产环境不要用 `prisma migrate dev`，而应使用 `prisma migrate deploy`。当前 `package.json` 里还没有这个脚本，但 Railway 可以直接执行命令。

建议在部署前或发布流程里执行：

```bash
npx prisma migrate deploy
```

如果需要演示数据，再执行：

```bash
npm run db:seed
```

在 Railway 后端服务里配置环境变量：

```env
NODE_ENV=production
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=...
CORS_ORIGIN=https://你的前台域名,https://你的后台域名
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
```

部署完成后，先验证：

- `https://你的后端域名/api/health`
- `https://你的后端域名/docs`

后端启动入口是 [main.ts](/D:/AI/Blog/backend/src/main.ts)，这里已经启用了：

- 全局前缀 `/api`
- CORS
- Swagger `/docs`

## 六、部署博客前台到 Vercel

在 Vercel 新建项目，选择同一个 GitHub 仓库。

这个项目只负责博客前台。

建议配置：

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build:web`
- Output：让 Vercel 按 Nuxt 项目自动识别
- Node 版本：22

最重要的环境变量：

```env
NUXT_PUBLIC_API_BASE_URL=https://你的后端域名/api
```

当前 Nuxt 配置读取的是这个变量，见 [nuxt.config.ts](/D:/AI/Blog/frontend/apps/web/nuxt.config.ts)。

部署后重点验证：

- 首页能打开
- 文章列表能拉到后端数据
- 搜索、分类、标签、项目页能正常请求 API
- 没有浏览器跨域报错

如果有跨域问题，回去检查 Railway 后端的 `CORS_ORIGIN`。

## 七、部署管理后台到 Vercel

再在 Vercel 新建第二个项目，还是同一个 GitHub 仓库，但专门部署管理后台。

建议配置：

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build:admin`
- Node 版本：22

如果后台已经有 API 基地址环境变量，就填：

```env
VITE_API_BASE_URL=https://你的后端域名/api
```

如果现在后台代码里还是写死本地地址，建议尽快改成环境变量方式；否则生产切换会比较麻烦。

部署后重点验证：

- 登录页能打开
- 登录请求能打到后端
- 文章、分类、标签、设置页面的请求都正常
- 刷新页面不报错

后台路由是 SPA，文件在 [index.ts](/D:/AI/Blog/frontend/apps/admin/src/router/index.ts)。Vercel 对这类前端应用通常比 GitHub Pages 省心。

## 八、域名与 HTTPS

等三部分都跑起来后，再绑自定义域名。

推荐分配：

- 前台博客绑定 `www`
- 后台绑定 `admin`
- API 绑定 `api`

绑定顺序建议：

1. 先让三个服务都用平台默认域名跑通
2. 再绑定自定义域名
3. 最后统一更新环境变量

需要同步更新的地方：

- 前台 Vercel 的 `NUXT_PUBLIC_API_BASE_URL`
- 后台的 API 基地址
- Railway 后端的 `CORS_ORIGIN`

如果顺序反了，容易出现跨域或旧域名缓存问题。

## 九、数据库迁移与发布流程

推荐以后每次发布都按这个节奏：

1. 本地改代码
2. 本地验证前后端 build
3. 提交到 GitHub
4. Railway / Vercel 自动触发部署
5. 后端先执行迁移
6. 前台和后台再读取新 API

生产数据库迁移命令建议固定为：

```bash
npx prisma migrate deploy
```

不要在生产库用：

```bash
prisma migrate dev
```

## 十、上线后的验收清单

### 前台博客

- 首页打开正常
- 文章列表正常
- 文章详情正常
- 分类、标签、归档、搜索正常
- 关于页面正常
- 项目列表、项目详情正常

### 后台

- 登录正常
- 登录后跳转正常
- 文章新增、编辑正常
- 分类管理正常
- 标签管理正常
- 站点设置正常

### 后端

- `/api/health` 正常
- `/docs` 正常
- 数据库连接正常
- JWT 登录链路正常
- CORS 无报错

## 十一、常见坑

### 1. `CORS` 没配全

如果前台和后台是两个域名，`CORS_ORIGIN` 必须同时包含它们。后端环境校验见 [env.validation.ts](/D:/AI/Blog/backend/src/config/env.validation.ts)。

### 2. API 地址还是本地地址

如果忘了设置 `NUXT_PUBLIC_API_BASE_URL`，前台会继续请求 `http://localhost:8000/api`。这个默认值写在 [nuxt.config.ts](/D:/AI/Blog/frontend/apps/web/nuxt.config.ts)。

### 3. 生产迁移命令用错

生产用 `prisma migrate deploy`，不是 `prisma migrate dev`。

### 4. 后台没做环境隔离

如果后台请求地址写死，部署后经常会出现“页面打开了但接口全失败”的情况。

### 5. 忘了 seed

如果生产库是空库，而前台首页依赖站点设置、文章、项目等数据，页面可能显示为空。需要视情况执行 [seed.ts](/D:/AI/Blog/backend/prisma/seed.ts)。

## 十二、建议补上的小改动

为了让方案 A 更稳，建议后续补这几项：

- 在 [backend/package.json](/D:/AI/Blog/backend/package.json) 增加生产迁移脚本，例如 `prisma:migrate:deploy`
- 给后台前端补统一的 `VITE_API_BASE_URL`
- 在仓库根目录补统一 `README.md`
- 增加 GitHub Actions 做基础检查：
  - 前端 `build:web`
  - 前端 `build:admin`
  - 后端 `build`
  - 后端 `check`

## 十三、最短上线路径

如果想先最快把它跑起来，最短路径是：

1. 把仓库推到 GitHub
2. Railway 建 Postgres
3. Railway 部署 `backend`
4. 配好后端环境变量并执行迁移
5. Vercel 部署 `apps/web`
6. Vercel 部署 `apps/admin`
7. 把前台和后台都指向 Railway API
8. 验证跨域与登录
