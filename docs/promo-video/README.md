# Multi-Screen Wireframe 介绍视频

成片：`multi-screen-wireframe-intro.mp4`（约 2 分 16 秒，1440×900）

## 内容结构

1. 开场：离线可双击、无需构建
2. 多屏画板：画布总览、缩放拖拽
3. 演示模式：热区、页面流跳转
4. 修改模式：点选节点 → AI Prompt
5. 注释：蓝色持久注释、本机保存
6. 帮助与设置：快捷键、语言切换
7. 移动端：travel-app demo
8. 导出与编辑：PNG/ZIP、屏级错误隔离
9. 结尾：功能总结

## 重新生成

```sh
cd docs/promo-video
pnpm install
pnpm exec playwright install ffmpeg   # 仅首次
node record.mjs                      # 录制 raw/*.webm
node compose.mjs tts                 # 旁白（需 mmx 已登录）
node compose.mjs compose              # 剪辑成片
```

旁白文案见 `narration.json`。
