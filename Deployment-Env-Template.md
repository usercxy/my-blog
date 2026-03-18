# Vercel / Railway 环境变量填写模板

这份文档用于配合方案 A 部署：

- GitHub：源码托管
- Vercel：博客前台 `frontend/apps/web`
- Vercel：管理后台 `frontend/apps/admin`
- Railway：后端 `backend`
- Railway PostgreSQL：数据库

如果你还没看过完整部署说明，先参考 [Deployment-Plan-A.md](/D:/AI/Blog/Deployment-Plan-A.md)。

## 一、推荐域名规划

建议先统一好域名，再去填写环境变量：

- 博客前台：`https://www.yourdomain.com`
- 管理后台：`https://admin.yourdomain.com`
- 后端 API：`https://api.yourdomain.com`

如果暂时不用自定义域名，也可以先用平台默认域名，例如：

- 博客前台：`https://personal-blog-web.vercel.app`
- 管理后台：`https://personal-blog-admin.vercel.app`
- 后端 API：`https://personal-blog-api.up.railway.app`

后面文档里的示例默认使用自定义域名形式。

## 二、Vercel 博客前台 `frontend/apps/web`

当前前台会读取 `NUXT_PUBLIC_API_BASE_URL`，见 [nuxt.config.ts](/D:/AI/Blog/frontend/apps/web/nuxt.config.ts)。

### 建议填写值

```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### 模板

```env
# Vercel Project: personal-blog-web
# Root Directory: frontend
# Build Command: npm run build:web

NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### 说明

- 必须带上 `/api`
- 不要填成 `http://localhost:8000/api`
- 如果后端还没绑定自定义域名，可以先填 Railway 默认域名，例如：

```env
NUXT_PUBLIC_API_BASE_URL=https://your-backend-service.up.railway.app/api
```

## 三、Vercel 管理后台 `frontend/apps/admin`

建议给管理后台也统一使用环境变量访问后端 API。这样切换环境更稳，也更方便后续预览部署。

如果你后面要接入这个变量，推荐命名：

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 模板

```env
# Vercel Project: personal-blog-admin
# Root Directory: frontend
# Build Command: npm run build:admin

VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 说明

- 这个变量是否生效，取决于后台代码是否已经读取它
- 如果后台当前还是写死本地地址，建议后续改为读取 `import.meta.env.VITE_API_BASE_URL`
- 同样必须带上 `/api`

## 四、Railway 后端 `backend`

后端启动时会校验这些环境变量，见 [env.validation.ts](/D:/AI/Blog/backend/src/config/env.validation.ts)。

### 必填环境变量

```env
NODE_ENV=production
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=postgresql://username:password@host:5432/database
CORS_ORIGIN=https://www.yourdomain.com,https://admin.yourdomain.com
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 模板

```env
# Railway Service: personal-blog-api
# Root Directory: backend

NODE_ENV=production
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=postgresql://username:password@host:5432/database
CORS_ORIGIN=https://www.yourdomain.com,https://admin.yourdomain.com
JWT_ACCESS_SECRET=your-access-secret-here
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d
```

### 字段说明

- `NODE_ENV`
  - 固定填 `production`
- `PORT`
  - 通常保持 `8000` 即可
- `APP_NAME`
  - 日志与健康检查显示名称
- `DATABASE_URL`
  - 使用 Railway PostgreSQL 提供的连接串
- `CORS_ORIGIN`
  - 前台和后台域名，多个值用英文逗号分隔
- `JWT_ACCESS_SECRET`
  - 用于生成访问令牌，长度建议至少 32 字节随机值
- `JWT_ACCESS_EXPIRES_IN`
  - 例如 `2h`
- `JWT_REFRESH_SECRET`
  - 用于生成刷新令牌，必须和 access secret 不同
- `JWT_REFRESH_EXPIRES_IN`
  - 例如 `7d`

### 开发阶段可替换为平台默认域名

```env
CORS_ORIGIN=https://personal-blog-web.vercel.app,https://personal-blog-admin.vercel.app
```

## 五、Railway PostgreSQL

数据库通常不需要你手动填很多环境变量，Railway 会自动提供连接信息。你真正需要做的是：

1. 在 Railway 创建 PostgreSQL 服务
2. 复制它提供的连接串
3. 把连接串填到后端服务的 `DATABASE_URL`

### 示例

```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:6543/railway
```

### 注意事项

- 不要把真实数据库连接串提交到 GitHub
- 如果密码里有特殊字符，连接串里要做 URL 编码
- 生产库迁移请使用：

```bash
npx prisma migrate deploy
```

## 六、建议的 Vercel / Railway 项目命名

为了后面排查更清楚，建议项目名称保持一致：

- Vercel 前台：`personal-blog-web`
- Vercel 后台：`personal-blog-admin`
- Railway 后端：`personal-blog-api`
- Railway 数据库：`personal-blog-db`

## 七、复制即用模板

### 1. Vercel 前台

```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### 2. Vercel 后台

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. Railway 后端

```env
NODE_ENV=production
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=postgresql://username:password@host:5432/database
CORS_ORIGIN=https://www.yourdomain.com,https://admin.yourdomain.com
JWT_ACCESS_SECRET=your-access-secret-here
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d
```

## 八、上线前最后检查

部署前逐项确认：

- 前台 `NUXT_PUBLIC_API_BASE_URL` 是否已改成生产地址
- 后台 `VITE_API_BASE_URL` 是否已改成生产地址
- 后端 `CORS_ORIGIN` 是否同时包含前台和后台域名
- 后端 `DATABASE_URL` 是否指向 Railway PostgreSQL
- `JWT_ACCESS_SECRET` 和 `JWT_REFRESH_SECRET` 是否为强随机值
- 所有真实密钥是否只存在于平台环境变量中，而不在仓库里

## 九、常见错误示例

### 错误 1：忘记加 `/api`

错误：

```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

正确：

```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### 错误 2：`CORS_ORIGIN` 只填了一个域名

错误：

```env
CORS_ORIGIN=https://www.yourdomain.com
```

正确：

```env
CORS_ORIGIN=https://www.yourdomain.com,https://admin.yourdomain.com
```

### 错误 3：把本地地址带到生产环境

错误：

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

正确：

```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```
