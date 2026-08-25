# 法規系統

臺北市數位實驗高級中等學校第五屆學生會 法規系統 — 純前端、可部屬到 GitHub Pages 的法規查閱網站。風格遵循 [T-Pass Design System](https://github.com/tschoolsu/regulatory-system)（Playful Tech / Bright Pop Tech）。

> 如何新增法規、本機開發與發布：請見 **[使用說明書](使用說明書.md)**。

## 快速開始

```bash
npm install
npm run dev      # 本地開發
npm run build    # 產出 dist/
npm run preview  # 預覽建置結果
```

## 如何新增 / 修訂法規

把 Markdown 檔案放進 `regulations/` 資料夾，資料夾結構就是分類：

```
regulations/
├─ 校規/
│  ├─ 個人行為/
│  │  └─ 1.md          ← 分類：校規 > 個人行為
│  └─ 集體行為/
│     └─ 社團活動管理要點.md
├─ 學生會/
│  └─ 組織章程.md
└─ 附錄/
   └─ 法規修訂流程.md
```

每個檔案最上方用 YAML 定義 metadata：

```markdown
---
title: 法規名稱
revision: 2026-08-25
tags: [校規, 個人行為]
author: 學生會權益部   # 選填
---

法規內文……
```

沒有 `title` 時會以檔名代替；`revision` 用於「最新修訂」排序。

## 支援的 HackMD 語法

- YAML metadata（`title` / `revision` / `tags` / `author` …）
- `[TOC]` 自動目錄
- HackMD 色塊：`:::info`、`:::note`、`:::tip`、`:::success`、`:::warning`、`:::danger`、`:::question`、`:::spoiler`
- GitHub Alerts：`> [!NOTE]`、`> [!TIP]`、`> [!IMPORTANT]`、`> [!WARNING]`、`> [!CAUTION]`
- GFM：表格、刪除線、任務清單、自動連結
- LaTeX 數學（KaTeX）：行內 `$...$`、區塊 `$$...$$`
- Mermaid 圖表（flowchart / sequenceDiagram / gantt …）
- Emoji 短代碼：`:smile:`、`:tada:` 等
- 腳註 `[^1]`、單一換行即斷行

## 部屬到 GitHub Pages

倉庫已附 GitHub Actions workflow（`.github/workflows/deploy.yml`）。

1. 在 GitHub 的 **Settings → Pages → Build and deployment** 選擇 **Source: GitHub Actions**
2. push 到 `main` 分支，Actions 會自動 `npm run build` 並發布 `dist/`
3. 站台網址：`https://<username>.github.io/<repo>/`

因為使用 `base: './'` 與 hash 路由，部署在任意子路徑都能直接使用，不需額外設定。

## 技術

- Vite + React 19 + TypeScript
- unified / remark / rehype 管線處理 Markdown（GFM、KaTeX、highlight.js、Mermaid）
- OKLCH 色票、純 light 模式、neobrutalism 樣式，全部自訂 CSS（無 Tailwind 依賴）
- `import.meta.glob` 在建置時期抓取 `regulations/**/*.md`，無需後端
