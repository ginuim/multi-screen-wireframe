# 小学生学习打卡 Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** 在 `student-checkin/` 交付可 file:// 打开的 Vue Global 学生学习打卡线框原型。

**Architecture:** 从 starter 复制；共享 `WfMobileLayout` + 4 Tab；8 个 screen；屏内 ref 演示打卡分流与提醒设置。

**Tech Stack:** vue-global@2、Wf 组件（见交付物 `COMPONENTS.md`）、无构建。

## Global Constraints

- 只改 `student-checkin/src/` 与 `index.html` title；禁止改 framework
- `@wireframe-skill multi-screen-wireframe@2.0.0`
- 无 emoji / 在线资源 / 后端；灰阶几何占位
- 列表 ≥3 条且尽量超一屏；稳定 id / class / data-wf-key

---

### Task 1: project + layout + 壳

- [x] 写 `src/project.js`（8 screens + links + components）
- [x] 写 `src/layouts/mobile-layout.js`（今日/记录/成就/我的）
- [x] 更新 `index.html` title
- [x] 删 starter 的 `home.js` / `detail.js`

### Task 2: 主路径四屏

- [x] `today.js` `task-detail.js` `checkin-result.js` `streak.js`

### Task 3: 次级四屏 + 样式

- [x] `badges.js` `parent-report.js` `reminders.js` `profile.js`
- [x] `src/styles/app.css`

### Task 4: 校验

- [x] `node scripts/check-project.mjs student-checkin`
- [x] 必要时 file:// / 浏览器抽查主路径
