# 法律咨询助手 - 用户端前端项目

基于 Vue3 + Vite + Tailwind CSS 开发的法律咨询平台用户端。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Font Awesome** - 图标库

## 项目结构

```
src/
├── api/              # API 接口封装
│   ├── request.js    # Axios 配置
│   ├── user.js       # 用户相关接口
│   ├── lawyer.js     # 律师相关接口
│   ├── appointment.js # 预约相关接口
│   ├── order.js      # 订单相关接口
│   ├── ai.js         # AI 对话接口
│   └── search.js     # 搜索接口
├── components/       # 公共组件
│   ├── Navbar.vue   # 导航栏
│   ├── Footer.vue   # 底部
│   └── LawyerCard.vue # 律师卡片
├── views/           # 页面组件
│   ├── Home.vue     # 首页（AI 聊天）
│   ├── Lawyers.vue  # 找律师
│   ├── Profile.vue  # 个人中心
│   └── Knowledge.vue # 法律文库
├── stores/          # Pinia 状态管理
│   └── user.js      # 用户状态
├── router/          # 路由配置
│   └── index.js
├── style.css        # 全局样式
└── main.js         # 入口文件
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能特性

### 1. 首页 - AI 法律助手
- 实时 AI 对话（SSE 流式响应）
- 常见法律服务分类展示
- 消息历史记录

### 2. 登录 / 注册
- 支持用户、律师、管理员多角色登录
- 律师入驻信息采集（律所、执业年限、擅长领域）
- 自定义提示气泡与表单校验

### 3. 找律师
- 律师列表展示
- 多条件筛选（专业领域、执业年限、价格）
- 排序功能（综合、评分、价格）
- 律师详情查看
- 立即咨询和预约面谈

### 4. 个人中心
- 用户信息展示
- 进行中的咨询
- 历史订单查看
- 预约记录管理

### 5. 法律文库
- 占位页面（待开发）

## API 配置

项目已配置代理，API 请求会自动转发到后端服务器：

- 开发环境：`http://localhost:8081/api`
- 配置位置：`vite.config.js`

## 状态管理

使用 Pinia 管理用户状态：
- 用户登录/注册
- 用户信息
- Token 管理

## 样式说明

- 使用 Tailwind CSS 进行样式开发
- 自定义品牌色配置在 `tailwind.config.js`
- 全局样式在 `src/style.css`

## 注意事项

1. 确保后端服务运行在 `http://localhost:8081`
2. SSE 流式对话需要后端支持 Server-Sent Events
3. 用户认证 Token 存储在 localStorage
4. 部分功能需要用户登录后才能使用

## 开发计划

- [ ] 完善移动端适配
- [ ] 添加预约功能完整流程
- [ ] 实现法律文库搜索功能
- [ ] 添加消息通知功能
- [ ] 优化 AI 对话体验

