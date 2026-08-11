# 小学生学习打卡 App 原型设计

日期：2026-08-11  
格式：`vue-global@2`（multi-screen-wireframe v2.0.0）  
输出目录：`student-checkin/`（仓库根下，与 `museum-exhibit` 并列）

## 目标

交付一份可双击打开的灰阶移动端多屏线框原型：小学生完成「作业 + 习惯」混合打卡；家长从「我的」进入查看周报与提醒设置，不管理任务。

## 决策摘要

| 项 | 选择 |
|---|---|
| 主用户 | 学生为主 + 家长旁观 |
| 打卡内容 | 作业 + 习惯混合清单 |
| 打卡方式 | 按类型分流：作业一键完成；习惯需凭证占位后再提交 |
| 家长能力 | 查看进度/周报 + 提醒设置；任务为演示预设 |
| 信息架构 | 方案 A：学生单端，家长入口嵌在「我的」 |

## 视口与壳层

- `defaultViewport`: `mobile`（375×812）
- 共享布局 `WfMobileLayout`：`WfMobileShell` + 底栏 4 Tab  
  - 今日 → `today`  
  - 记录 → `streak`  
  - 成就 → `badges`  
  - 我的 → `profile`
- 非 Tab 屏（`task-detail`、`checkin-result`、`parent-report`、`reminders`）仍可包在同一壳或带返回的 NavBar；Tab 高亮跟随当前屏所属分区（详情类回落到「今日」或来源 Tab）

## 页面流

| id | 标题 | entry | links |
|---|---|---|---|
| `today` | 今日打卡 | 是 | `task-detail`, `checkin-result`, `streak`, `badges`, `profile` |
| `task-detail` | 任务详情 | | `today`, `checkin-result`, `streak`, `badges`, `profile` |
| `checkin-result` | 打卡成功 | | `today`, `streak`, `badges`, `profile` |
| `streak` | 连续记录 | | `today`, `badges`, `profile` |
| `badges` | 成就 | | `today`, `streak`, `profile` |
| `parent-report` | 家长周报 | | `profile`, `reminders`, `today`, `streak`, `badges` |
| `reminders` | 提醒设置 | | `profile`, `parent-report`, `today`, `streak`, `badges` |
| `profile` | 我的 | | `parent-report`, `reminders`, `today`, `streak`, `badges` |

主路径：

```
today → task-detail → checkin-result → today
profile → parent-report
profile → reminders
```

## 数据结构（演示态，屏内写死）

```text
Task {
  id: string
  title: string
  type: 'homework' | 'habit'
  subject?: string      // 作业科目
  duration?: string     // 习惯时长文案，如「20 分钟」
  status: 'pending' | 'done'
  note?: string
  evidence?: boolean    // 习惯是否已选凭证
}

DayRecord {
  date: string          // YYYY-MM-DD
  done: number
  total: number
  summary: string
}

Badge {
  id: string
  name: string
  earned: boolean
  rule: string
}

ReminderSettings {
  enabled: boolean
  time: string          // 如 19:30
  types: { homework: boolean, habit: boolean }
}

ChildProfile {
  name: string
  grade: string
  streakDays: number
}
```

今日清单至少 5–6 条，作业与习惯混排，列表区超过一屏可滚。成就至少 4 枚。近 7 日摘要至少 7 条。

## 各屏内容与交互

### today

- 顶部：孩子名、今日完成 `done/total`、连续天数
- 分区列表：作业 / 习惯；条目含标题、科目或时长、状态
- 点任意待办/已办条目 → `task-detail`
- Tab 底栏

### task-detail

- 无路由参数：屏内 `activeTask` 默认作业样例；页内提供「作业样例 / 习惯样例」切换，用来演示两种打卡流
- 任务说明、类型标签随 `activeTask` 变化
- `homework`：主按钮「完成打卡」→ `checkin-result`
- `habit`：凭证几何占位 →「添加凭证」切已选态 →「提交打卡」→ `checkin-result`
- 习惯未选凭证时提交：`WfToast` 提示，不跳转
- 返回 → `today`

### checkin-result

- 大号连续天数、本任务完成态
- 「回今日」→ `today`；「看记录」→ `streak`

### streak

- 本月日历：完成日实心块占位
- 近 7 日摘要列表（可滚）

### badges

- 已获 / 未获勋章；未获得灰显 + 解锁条件文案

### parent-report

- 从 profile 进入
- 本周完成率、作业概况、习惯坚持、一句家长摘要
- 无增删改任务

### reminders

- 总开关、提醒时间、适用类型勾选
- 变更仅屏内 `ref` 演示

### profile

- 孩子档案占位
- 入口：家长周报、提醒设置
- 版本/关于文案

## 技术约束

- 复制源：整个 `starter/`；生成：`node scripts/create-project.mjs student-checkin`
- 只改目标 `src/`（`project.js`、`screens/*.js`、`layouts/`、`styles/app.css`、`index.html` title）；禁止改 `framework/`
- 无 `import`/`export`；`WireframeVue.defineScreen` / `defineComponent` / `defineProject`
- 导航用组件 `to`；`links` 为唯一边数据
- DOM：语义 class、screen 前缀 id、列表稳定 `data-wf-key`
- 文件头版本注释：`multi-screen-wireframe@2.0.0`
- `annotations.js` 保持空注册，不预置注释
- 灰阶；无 emoji、Unicode 图标、业务 SVG、在线资源、真实后端
- 校验：`node scripts/check-project.mjs student-checkin`；`file://` 打开 `student-checkin/index.html`

## 非目标

- 家长增删改任务、审核凭证、奖励规则配置
- 真实拍照/上传、账号登录、多孩子切换
- 桌面端视口、彩色视觉稿
- 双角色顶栏切换或独立家长 App

## 完成标准

- 8 个 screen 文件与 `project.screens` 一一对应
- 主路径可点通：今日 → 详情打卡 → 成功 → 回今日 / 记录
- 习惯无凭证提交只 Toast
- 家长周报与提醒可从「我的」进入并可返回
- TabBar 贴底，长列表在 shell body 内滚
- `check-project.mjs` 通过；控制台无 Vue 编译/运行错误
