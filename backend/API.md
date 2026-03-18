# Personal Blog Backend API

基于当前后端代码实现整理的独立 API 文档。

这份文档描述的是“当前已经实现并可调用”的接口，不是技术方案里的未来规划接口全集。

## 1. 基本信息

- 默认本地地址：`http://localhost:8000`
- 全局前缀：`/api`
- Swagger 地址：`/docs`
- 默认响应格式：JSON
- SEO 接口返回 XML 或纯文本

说明：

- 如果 `8000` 端口被占用，服务会自动切换到后续可用端口
- 实际访问地址请以启动日志输出为准

## 2. 通用响应结构

成功响应统一为：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "uuid",
  "timestamp": "2026-03-17T06:43:06.916Z"
}
```

字段说明：

- `code`：业务状态码，成功固定为 `0`
- `message`：响应消息
- `data`：接口实际数据
- `requestId`：请求追踪 ID
- `timestamp`：服务端响应时间

异常响应同样会尽量保持统一结构，`code` 通常为 HTTP 状态码。

## 3. 鉴权说明

后台管理接口需要 Bearer Token。

请求头格式：

```http
Authorization: Bearer <accessToken>
```

获取方式：

1. 调用 `POST /api/admin/auth/login`
2. 从返回结果里的 `data.accessToken` 取值

刷新方式：

1. 调用 `POST /api/admin/auth/refresh`
2. 使用登录返回的 `refreshToken`

## 4. 通用分页参数

支持分页的接口统一使用：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码，从 1 开始 |
| `pageSize` | number | `10` | 每页数量，最大 `100` |

## 5. 枚举说明

### 5.1 文章状态 `PostStatus`

- `DRAFT`
- `PUBLISHED`
- `HIDDEN`

### 5.2 页面状态 `PageStatus`

- `DRAFT`
- `PUBLISHED`

### 5.3 项目状态 `ProjectStatus`

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

### 5.4 媒体存储类型 `MediaStorage`

- `LOCAL`
- `S3`
- `OSS`
- `MINIO`

## 6. 健康检查

### 6.1 服务健康

- 方法：`GET`
- 路径：`/api/health`
- 鉴权：否

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "service": "personal-blog-api",
    "uptime": 12.34,
    "databaseConfigured": true
  }
}
```

### 6.2 数据库健康

- 方法：`GET`
- 路径：`/api/health/db`
- 鉴权：否

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "database": "postgresql"
  }
}
```

## 7. 认证接口

### 7.1 管理员登录

- 方法：`POST`
- 路径：`/api/admin/auth/login`
- 鉴权：否

请求体：

```json
{
  "username": "admin",
  "password": "admin123456"
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 管理员用户名 |
| `password` | string | 是 | 管理员密码，最少 6 位 |

响应数据说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `accessToken` | string | 后台接口访问令牌 |
| `refreshToken` | string | 刷新令牌 |
| `user` | object | 当前管理员资料 |

### 7.2 刷新凭证

- 方法：`POST`
- 路径：`/api/admin/auth/refresh`
- 鉴权：否

请求体：

```json
{
  "refreshToken": "your-refresh-token"
}
```

### 7.3 当前管理员信息

- 方法：`GET`
- 路径：`/api/admin/auth/profile`
- 鉴权：是

响应数据示例：

```json
{
  "id": "1",
  "username": "admin",
  "displayName": "博客管理员",
  "email": "admin@example.com",
  "avatar": null,
  "isActive": true,
  "createdAt": "2026-03-17T06:12:26.623Z",
  "updatedAt": "2026-03-17T06:43:07.954Z"
}
```

## 8. 文章管理接口

### 8.1 文章列表

- 方法：`GET`
- 路径：`/api/admin/posts`
- 鉴权：是

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 标题或摘要关键词 |
| `status` | `PostStatus` | 否 | 文章状态筛选 |
| `categoryId` | string | 否 | 分类 ID |
| `tagId` | string | 否 | 标签 ID |

### 8.2 文章详情

- 方法：`GET`
- 路径：`/api/admin/posts/:id`
- 鉴权：是

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 文章 ID |

### 8.3 新建文章

- 方法：`POST`
- 路径：`/api/admin/posts`
- 鉴权：是

请求体：

```json
{
  "title": "我的第一篇文章",
  "slug": "my-first-post",
  "summary": "文章摘要",
  "cover": "/uploads/cover.png",
  "status": "DRAFT",
  "markdownContent": "# 标题",
  "htmlContent": "<h1>标题</h1>",
  "tocJson": [],
  "categoryIds": ["1"],
  "tagIds": ["1", "2"],
  "isTop": false,
  "seoTitle": "SEO 标题",
  "seoKeywords": "关键词1,关键词2",
  "seoDescription": "SEO 描述"
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 标题，最多 200 字 |
| `slug` | string | 否 | 自定义 slug |
| `summary` | string | 否 | 摘要，最多 500 字 |
| `cover` | string | 否 | 封面地址 |
| `status` | `PostStatus` | 否 | 默认 `DRAFT` |
| `markdownContent` | string | 是 | Markdown 正文 |
| `htmlContent` | string | 否 | HTML 内容 |
| `tocJson` | any | 否 | 目录 JSON |
| `categoryIds` | string[] | 是 | 至少一个分类 ID |
| `tagIds` | string[] | 否 | 标签 ID 列表 |
| `isTop` | boolean | 否 | 是否置顶 |
| `seoTitle` | string | 否 | SEO 标题 |
| `seoKeywords` | string | 否 | SEO 关键词 |
| `seoDescription` | string | 否 | SEO 描述 |

说明：

- 当文章状态是 `PUBLISHED` 时，标题、正文、分类不能为空

### 8.4 编辑文章

- 方法：`PUT`
- 路径：`/api/admin/posts/:id`
- 鉴权：是

请求体字段与“新建文章”一致，全部为可选字段。

### 8.5 更新文章状态

- 方法：`PATCH`
- 路径：`/api/admin/posts/:id/status`
- 鉴权：是

请求体：

```json
{
  "status": "PUBLISHED"
}
```

### 8.6 删除文章

- 方法：`DELETE`
- 路径：`/api/admin/posts/:id`
- 鉴权：是

## 9. 分类管理接口

### 9.1 分类列表

- 方法：`GET`
- 路径：`/api/admin/categories`
- 鉴权：是

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 名称或 slug 关键词 |

### 9.2 新建分类

- 方法：`POST`
- 路径：`/api/admin/categories`
- 鉴权：是

请求体：

```json
{
  "name": "后端架构",
  "slug": "backend-architecture",
  "description": "后端工程、架构设计与服务治理相关文章。"
}
```

### 9.3 更新分类

- 方法：`PUT`
- 路径：`/api/admin/categories/:id`
- 鉴权：是

### 9.4 删除分类

- 方法：`DELETE`
- 路径：`/api/admin/categories/:id`
- 鉴权：是

说明：

- 如果分类仍被文章引用，会返回冲突错误

## 10. 标签管理接口

### 10.1 标签列表

- 方法：`GET`
- 路径：`/api/admin/tags`
- 鉴权：是

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 名称或 slug 关键词 |

### 10.2 新建标签

- 方法：`POST`
- 路径：`/api/admin/tags`
- 鉴权：是

请求体：

```json
{
  "name": "NestJS",
  "slug": "nestjs"
}
```

### 10.3 更新标签

- 方法：`PUT`
- 路径：`/api/admin/tags/:id`
- 鉴权：是

### 10.4 删除标签

- 方法：`DELETE`
- 路径：`/api/admin/tags/:id`
- 鉴权：是

说明：

- 如果标签仍被文章引用，会返回冲突错误

## 11. 页面管理接口

### 11.1 获取页面内容

- 方法：`GET`
- 路径：`/api/admin/pages/:key`
- 鉴权：是

说明：

- 当前种子数据默认存在 `about` 页面

### 11.2 更新页面内容

- 方法：`PUT`
- 路径：`/api/admin/pages/:key`
- 鉴权：是

请求体：

```json
{
  "title": "关于我",
  "slug": "about",
  "summary": "个人博客关于页",
  "content": "这里是页面内容",
  "status": "PUBLISHED",
  "seoTitle": "关于我",
  "seoKeywords": "关于,博客",
  "seoDescription": "页面 SEO 描述"
}
```

## 12. 项目管理接口

### 12.1 项目列表

- 方法：`GET`
- 路径：`/api/admin/projects`
- 鉴权：是

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 标题或 slug 关键词 |

### 12.2 新建项目

- 方法：`POST`
- 路径：`/api/admin/projects`
- 鉴权：是

请求体：

```json
{
  "title": "Personal Blog Platform",
  "slug": "personal-blog-platform",
  "summary": "项目简介",
  "content": "项目详情",
  "cover": "/uploads/project.png",
  "repoUrl": "https://example.com/repo",
  "previewUrl": "https://example.com/demo",
  "status": "PUBLISHED"
}
```

### 12.3 更新项目

- 方法：`PUT`
- 路径：`/api/admin/projects/:id`
- 鉴权：是

### 12.4 删除项目

- 方法：`DELETE`
- 路径：`/api/admin/projects/:id`
- 鉴权：是

## 13. 站点设置接口

### 13.1 获取站点设置

- 方法：`GET`
- 路径：`/api/admin/site/settings`
- 鉴权：是

### 13.2 更新站点设置

- 方法：`PUT`
- 路径：`/api/admin/site/settings`
- 鉴权：是

请求体：

```json
{
  "siteName": "个人博客",
  "siteDescription": "博客简介",
  "siteUrl": "http://localhost:3000",
  "logo": "/logo.png",
  "favicon": "/favicon.ico",
  "seoTitle": "个人博客",
  "seoKeywords": "博客,NestJS,Prisma",
  "seoDescription": "站点 SEO 描述"
}
```

## 14. 概览统计接口

### 14.1 获取概览数据

- 方法：`GET`
- 路径：`/api/admin/stats/dashboard`
- 鉴权：是

返回内容包含：

- 文章数量
- 分类数量
- 标签数量
- 最近更新时间
- 热门文章排行

## 15. 备份接口

### 15.1 导出数据

- 方法：`POST`
- 路径：`/api/admin/backup/export`
- 鉴权：是

说明：

- 当前返回 JSON 结构化导出结果
- 导出内容包含文章、分类、标签、页面、项目、站点设置、媒体记录

## 16. 媒体接口

### 16.1 媒体列表

- 方法：`GET`
- 路径：`/api/admin/media`
- 鉴权：是

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |

### 16.2 新增媒体记录

- 方法：`POST`
- 路径：`/api/admin/media/upload`
- 鉴权：是

说明：

- 当前实现的是“媒体元数据入库”
- 还不是 multipart 文件上传

请求体：

```json
{
  "filename": "demo-cover.png",
  "originalName": "demo-cover.png",
  "mimeType": "image/png",
  "storage": "LOCAL",
  "path": "/uploads/demo-cover.png",
  "size": 1024
}
```

## 17. 公开内容接口

### 17.1 首页聚合数据

- 方法：`GET`
- 路径：`/api/public/home`
- 鉴权：否

返回内容包含：

- 站点设置
- 分类列表
- 项目列表
- 置顶文章
- 最新文章

### 17.2 公开文章列表

- 方法：`GET`
- 路径：`/api/public/posts`
- 鉴权：否

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 标题或摘要关键词 |
| `status` | `PostStatus` | 否 | 当前实现会被服务端限制为 `PUBLISHED` |
| `categoryId` | string | 否 | 分类 ID |
| `tagId` | string | 否 | 标签 ID |

### 17.3 公开文章详情

- 方法：`GET`
- 路径：`/api/public/posts/:slug`
- 鉴权：否

说明：

- 仅返回已发布文章
- 访问时会记录访问统计

### 17.4 分类列表

- 方法：`GET`
- 路径：`/api/public/categories`
- 鉴权：否

### 17.5 分类下文章列表

- 方法：`GET`
- 路径：`/api/public/categories/:slug/posts`
- 鉴权：否

### 17.6 标签列表

- 方法：`GET`
- 路径：`/api/public/tags`
- 鉴权：否

### 17.7 标签下文章列表

- 方法：`GET`
- 路径：`/api/public/tags/:slug/posts`
- 鉴权：否

### 17.8 归档数据

- 方法：`GET`
- 路径：`/api/public/archive`
- 鉴权：否

### 17.9 搜索

- 方法：`GET`
- 路径：`/api/public/search`
- 鉴权：否

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `keyword` | string | 否 | 搜索关键词，最少 1 个字符 |

说明：

- 会记录搜索日志
- 当前搜索范围包括标题、摘要、正文、标签名称

### 17.10 关于页

- 方法：`GET`
- 路径：`/api/public/about`
- 鉴权：否

### 17.11 项目列表

- 方法：`GET`
- 路径：`/api/public/projects`
- 鉴权：否

### 17.12 项目详情

- 方法：`GET`
- 路径：`/api/public/projects/:slug`
- 鉴权：否

### 17.13 站点设置

- 方法：`GET`
- 路径：`/api/public/site`
- 鉴权：否

## 18. SEO 接口

### 18.1 Sitemap

- 方法：`GET`
- 路径：`/api/sitemap.xml`
- 鉴权：否
- 返回类型：`application/xml`

说明：

- 根据站点设置、文章、分类、标签、页面、项目动态生成

### 18.2 Robots

- 方法：`GET`
- 路径：`/api/robots.txt`
- 鉴权：否
- 返回类型：`text/plain`

## 19. 已实现后台接口总览

| 方法 | 路径 | 鉴权 |
| --- | --- | --- |
| `POST` | `/api/admin/auth/login` | 否 |
| `POST` | `/api/admin/auth/refresh` | 否 |
| `GET` | `/api/admin/auth/profile` | 是 |
| `GET` | `/api/admin/posts` | 是 |
| `GET` | `/api/admin/posts/:id` | 是 |
| `POST` | `/api/admin/posts` | 是 |
| `PUT` | `/api/admin/posts/:id` | 是 |
| `PATCH` | `/api/admin/posts/:id/status` | 是 |
| `DELETE` | `/api/admin/posts/:id` | 是 |
| `GET` | `/api/admin/categories` | 是 |
| `POST` | `/api/admin/categories` | 是 |
| `PUT` | `/api/admin/categories/:id` | 是 |
| `DELETE` | `/api/admin/categories/:id` | 是 |
| `GET` | `/api/admin/tags` | 是 |
| `POST` | `/api/admin/tags` | 是 |
| `PUT` | `/api/admin/tags/:id` | 是 |
| `DELETE` | `/api/admin/tags/:id` | 是 |
| `GET` | `/api/admin/pages/:key` | 是 |
| `PUT` | `/api/admin/pages/:key` | 是 |
| `GET` | `/api/admin/projects` | 是 |
| `POST` | `/api/admin/projects` | 是 |
| `PUT` | `/api/admin/projects/:id` | 是 |
| `DELETE` | `/api/admin/projects/:id` | 是 |
| `GET` | `/api/admin/site/settings` | 是 |
| `PUT` | `/api/admin/site/settings` | 是 |
| `GET` | `/api/admin/stats/dashboard` | 是 |
| `POST` | `/api/admin/backup/export` | 是 |
| `GET` | `/api/admin/media` | 是 |
| `POST` | `/api/admin/media/upload` | 是 |

## 20. 已实现公开接口总览

| 方法 | 路径 |
| --- | --- |
| `GET` | `/api/health` |
| `GET` | `/api/health/db` |
| `GET` | `/api/public/home` |
| `GET` | `/api/public/posts` |
| `GET` | `/api/public/posts/:slug` |
| `GET` | `/api/public/categories` |
| `GET` | `/api/public/categories/:slug/posts` |
| `GET` | `/api/public/tags` |
| `GET` | `/api/public/tags/:slug/posts` |
| `GET` | `/api/public/archive` |
| `GET` | `/api/public/search` |
| `GET` | `/api/public/about` |
| `GET` | `/api/public/projects` |
| `GET` | `/api/public/projects/:slug` |
| `GET` | `/api/public/site` |
| `GET` | `/api/sitemap.xml` |
| `GET` | `/api/robots.txt` |

## 21. 测试账号

当前种子数据默认管理员账号：

```text
username: admin
password: admin123456
```

## 22. 建议使用方式

如果你想要最完整、最实时的调试体验：

1. 启动后端服务
2. 先用 [backend/API.md](D:/AI/Blog/backend/API.md) 看接口结构
3. 再访问 Swagger 页面 `/docs` 进行在线调试

这样最适合前后端联调和接口核对。
