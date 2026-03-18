# Personal Blog Backend

基于《个人博客后端技术文档-Nodejs》搭建的个人博客后端基础工程。

当前阶段目标不是业务功能完备，而是先把一套可以稳定启动、可连接 PostgreSQL、具备清晰模块边界和后续扩展空间的后端框架搭起来。现在这个项目已经完成基础骨架、数据库迁移、种子数据、健康检查和 Swagger 文档入口，可以作为后续业务开发的起点。

## 1. 项目定位

本项目用于支撑个人博客的后端能力，后续会围绕以下方向逐步扩展：

- 前台公开接口
- 后台管理接口
- 内容管理
- 站点配置
- 搜索与统计
- 鉴权与安全控制
- 备份与可维护性能力

当前已完成的是“框架可运行”这一阶段，适合先接数据库、联调前端、继续补业务模块。

## 2. 技术栈

- Node.js 20+
- NestJS 11
- TypeScript
- Prisma
- PostgreSQL
- Swagger / OpenAPI
- class-validator
- Joi

## 3. 当前已实现能力

- NestJS 服务基础工程可启动
- Prisma 已接入 PostgreSQL
- 初始数据库迁移已创建并验证可执行
- 已提供最小演示数据 seed 脚本
- 已接入统一响应结构
- 已接入统一异常过滤器
- 已接入请求 ID 中间件
- 已接入全局参数校验
- 已提供 Swagger 文档入口
- 已按技术文档预留业务模块目录
- 服务启动时会自动寻找可用端口，避免默认端口冲突直接导致启动失败

## 4. 当前目录结构

```text
backend/
├─ prisma/
│  ├─ migrations/                # Prisma 迁移记录
│  ├─ schema.prisma              # 数据模型定义
│  └─ seed.ts                    # 演示数据脚本
├─ src/
│  ├─ common/                    # 通用能力：异常、响应、请求 ID
│  ├─ config/                    # 环境变量校验
│  ├─ modules/                   # 业务模块目录
│  ├─ prisma/                    # PrismaService 与模块封装
│  ├─ app.module.ts              # 应用根模块
│  └─ main.ts                    # 应用启动入口
├─ .env.example                  # 环境变量示例
├─ nest-cli.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 5. 业务模块规划

当前已经预留以下模块目录，后续会按文档逐步填充实现：

- `AuthModule`
- `UserModule`
- `PostModule`
- `CategoryModule`
- `TagModule`
- `SearchModule`
- `PageModule`
- `ProjectModule`
- `SiteModule`
- `MediaModule`
- `StatsModule`
- `BackupModule`
- `SeoModule`

目前真正带有 demo 接口的模块主要有：

- `HealthModule`
- `PublicModule`
- `AdminModule`

## 6. 环境要求

本地开发建议使用以下环境：

- Node.js `>= 20`
- npm `>= 10`
- PostgreSQL `15+`，或至少使用一个 Prisma 可正常连接的 PostgreSQL 实例

如果你在 PowerShell 中遇到 `npm.ps1` 执行策略问题，请使用：

```bash
npm.cmd install
```

## 7. 环境变量说明

项目默认读取：

- `.env.local`
- `.env`

后者已包含基础示例配置。

### `.env` 示例

```env
NODE_ENV=development
PORT=8000
APP_NAME=personal-blog-api
DATABASE_URL=postgresql://username:password@localhost:5432/personal_blog
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 字段说明

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 首选监听端口。若被占用，服务会自动顺延寻找可用端口 | `8000` |
| `APP_NAME` | 应用名称，用于日志与健康检查输出 | `personal-blog-api` |
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@localhost:5432/personal_blog` |
| `CORS_ORIGIN` | 允许跨域来源，多个地址用英文逗号分隔 | `http://localhost:3000,http://localhost:5173` |

### PostgreSQL 连接串格式

```env
DATABASE_URL=postgresql://用户名:密码@主机:端口/数据库名
```

如果密码里有特殊字符，需要进行 URL 编码，例如：

- `@` 写成 `%40`
- `:` 写成 `%3A`
- `/` 写成 `%2F`
- `#` 写成 `%23`

## 8. 安装依赖

在 [backend](D:/AI/Blog/backend) 目录执行：

```bash
npm.cmd install
```

## 9. 数据库初始化

### 9.1 第一次使用

确保 PostgreSQL 数据库已经创建，且 `.env` 中的 `DATABASE_URL` 可用后，执行：

```bash
npm.cmd run prisma:generate
npm.cmd run prisma:migrate:dev -- --name init
npm.cmd run db:seed
```

这三步分别完成：

1. 生成 Prisma Client
2. 应用数据库迁移
3. 写入最小演示数据

### 9.2 当前已包含的演示数据

`db:seed` 会写入一组最小样例，方便后续联调：

- 1 个管理员用户
- 1 篇演示文章
- 1 个分类
- 2 个标签
- 1 个关于页
- 1 个项目
- 1 条站点设置
- 1 条访问统计样例
- 1 条搜索日志样例
- 1 条操作日志样例

seed 脚本做了幂等处理，重复执行不会无限新增核心主数据。

### 9.3 查看数据库

如果你想直接查看 Prisma 连接到的数据库内容，可以执行：

```bash
npm.cmd run prisma:studio
```

## 10. 启动项目

### 开发模式

```bash
npm.cmd run start:dev
```

### 生产构建启动

```bash
npm.cmd run build
npm.cmd run start
```

### 说明

- 默认优先使用 `.env` 中的 `PORT`，当前默认值是 `8000`
- 如果该端口已被占用，程序会自动切换到后续可用端口
- 实际启动端口请以控制台日志为准

## 11. 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm.cmd install` | 安装依赖 |
| `npm.cmd run check` | TypeScript 静态检查 |
| `npm.cmd run build` | 构建生产产物 |
| `npm.cmd run start:dev` | 开发模式启动 |
| `npm.cmd run start` | 使用构建产物启动 |
| `npm.cmd run start:prod` | 等同于生产模式启动 |
| `npm.cmd run prisma:generate` | 生成 Prisma Client |
| `npm.cmd run prisma:migrate:dev -- --name init` | 执行开发迁移 |
| `npm.cmd run db:seed` | 灌入演示数据 |
| `npm.cmd run prisma:studio` | 打开 Prisma Studio |

## 12. 当前可访问接口

启动成功后，可以先用下面这些接口确认服务正常：

### 基础健康检查

- `GET /api/health`
- `GET /api/health/db`

### Demo 公开接口

- `GET /api/public/home`

### Demo 管理接口

- `GET /api/admin/system/ping`

### Swagger 文档

- `GET /docs`

## 13. 返回结构约定

当前服务已经按技术文档接入统一响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "uuid",
  "timestamp": "2026-03-17T06:19:37.623Z"
}
```

说明：

- `code = 0` 表示成功
- `message` 为统一消息文本
- `data` 为实际业务数据
- `requestId` 用于排查日志
- `timestamp` 为服务端响应时间

异常响应也会尽量保持统一格式。

## 14. 当前数据库模型

当前 Prisma schema 已覆盖文档中的核心实体：

- `users`
- `posts`
- `post_contents`
- `categories`
- `tags`
- `post_categories`
- `post_tags`
- `pages`
- `projects`
- `site_settings`
- `media_files`
- `visit_stats`
- `search_logs`
- `operation_logs`

并已创建对应枚举：

- `PostStatus`
- `PageStatus`
- `ProjectStatus`
- `MediaStorage`

## 15. 已实现的基础工程能力

### 15.1 全局前缀

当前 API 全局前缀为：

```text
/api
```

### 15.2 CORS

支持通过 `CORS_ORIGIN` 配置前端来源白名单，当前默认适配：

- `http://localhost:3000`
- `http://localhost:5173`

### 15.3 参数校验

已启用 Nest 全局 `ValidationPipe`，配置如下：

- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

### 15.4 统一异常处理

已接入 [http-exception.filter.ts](D:/AI/Blog/backend/src/common/filters/http-exception.filter.ts)，用于格式化异常返回。

### 15.5 统一响应封装

已接入 [response.interceptor.ts](D:/AI/Blog/backend/src/common/interceptors/response.interceptor.ts)，用于统一成功响应格式。

### 15.6 请求追踪

已接入 [request-id.middleware.ts](D:/AI/Blog/backend/src/common/middleware/request-id.middleware.ts)，用于生成或透传 `x-request-id`。

### 15.7 环境变量校验

已接入 [env.validation.ts](D:/AI/Blog/backend/src/config/env.validation.ts)，启动时会校验关键环境变量是否合法。

## 16. 已验证结果

当前项目已经实际完成以下验证：

- `npm.cmd install`
- `npm.cmd run prisma:generate`
- `npm.cmd run prisma:migrate:dev -- --name init`
- `npm.cmd run db:seed`
- `npm.cmd run check`
- `npm.cmd run build`
- 生产构建可成功启动
- `/api/health` 返回正常
- `/api/health/db` 返回 PostgreSQL 连接正常
- `/api/public/home` 返回 demo 数据

## 17. 开发建议

接下来建议按以下顺序继续推进：

1. 实现 `AuthModule`，完成管理员登录与 JWT 鉴权基础链路。
2. 实现 `PostModule`、`CategoryModule`、`TagModule` 的增删改查。
3. 实现公开接口与后台接口的 DTO、Service、Controller 分层。
4. 为前端项目逐步替换 mock 数据，接入真实 API。
5. 引入 Redis、日志、缓存、限流等增强能力。

## 18. 常见问题

### 18.1 `P1000 Authentication failed`

说明 `.env` 中的 `DATABASE_URL` 用户名或密码错误，请检查：

- 数据库用户名
- 数据库密码
- 数据库名是否存在
- 密码中是否包含未编码的特殊字符

### 18.2 `npm.ps1 cannot be loaded`

这是 PowerShell 执行策略问题，请改用：

```bash
npm.cmd install
```

以及其他 `npm.cmd` 形式命令。

### 18.3 默认端口被占用

项目已内置自动端口回退逻辑。如果 `8000` 被占用，应用会自动切换到后续可用端口。请以启动日志输出为准。

### 18.4 迁移失败

先确认：

- PostgreSQL 服务可访问
- `.env` 中连接串正确
- 当前数据库用户具备建表权限

然后重新执行：

```bash
npm.cmd run prisma:migrate:dev -- --name init
```

## 19. 关键文件

- [package.json](D:/AI/Blog/backend/package.json)
- [prisma/schema.prisma](D:/AI/Blog/backend/prisma/schema.prisma)
- [prisma/seed.ts](D:/AI/Blog/backend/prisma/seed.ts)
- [src/main.ts](D:/AI/Blog/backend/src/main.ts)
- [src/app.module.ts](D:/AI/Blog/backend/src/app.module.ts)
- [src/prisma/prisma.service.ts](D:/AI/Blog/backend/src/prisma/prisma.service.ts)

## 20. 下一步

如果继续往下开发，这个 README 可以再补两类内容：

- 业务接口说明
- 部署与发布说明

等进入实际业务开发阶段后，再把模块级 API 文档、鉴权方式、错误码表和部署流程写进来会更合适。
