# 法規系統

臺北市數位實驗高級中等學校第五屆學生會 法規系統 — 純前端、部署在 GitHub Pages 的法規查閱網站，
是 [T-Pass](https://github.com/tschoolsu) 生態系裡的公開服務（`law.tschoolsu.org`，不接 SSO）。
風格遵循 [T-Pass Design System](https://github.com/tschoolsu/tpass-portal/blob/main/docs/design.md)
（Playful Tech / Bright Pop Tech），UI 元件吃共用套件
[`tpass-ui`](https://github.com/tschoolsu/tpass-ui)。

> 如何新增法規、本機開發與發布：請見 **[使用說明書](使用說明書.md)**。
> 生態系地圖、跨服務規範：請見上層 [`tpass-ops`](https://github.com/tschoolsu/tpass-ops) 的
> `AGENTS.md`。

## 快速開始

```bash
pnpm install
pnpm dev      # 本地開發
pnpm build    # 產出 dist/
pnpm preview  # 預覽建置結果
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

倉庫已附 GitHub Actions workflow（`.github/workflows/deploy.yml`），用 pnpm。

1. 在 GitHub 的 **Settings → Pages → Build and deployment** 選擇 **Source: GitHub Actions**，
   Custom domain 填 `law.tschoolsu.org`（`public/CNAME` 已內建這個網域，Vite 會原樣複製進 `dist/`）
2. push 到 `main` 分支，Actions 會自動 lint + `pnpm build` 並發布 `dist/`
3. 站台網址：`https://law.tschoolsu.org`（DNS 由 Cloudflare CNAME 指到 GitHub Pages，
   細節見 `tpass-registry/services.json` 裡 `law` 這條的 `note`）

因為使用 `base: './'` 與 hash 路由，就算之後改回不掛自訂網域、退回 `<username>.github.io/<repo>/`
這種子路徑，也不需要額外設定。

## 技術

- Vite + React 19 + TypeScript
- unified / remark / rehype 管線處理 Markdown（GFM、KaTeX、highlight.js、Mermaid）
- Tailwind CSS v4 + [`tpass-ui`](https://github.com/tschoolsu/tpass-ui)：OKLCH 色票、純 light
  模式、neobrutalism 樣式；`src/index.css` 只保留 markdown 渲染出的內容
  （`.prose-md`/`.callout`）跟樹狀導覽這類 Tailwind 掃不到、或用 utility 表達反而更難讀的部分
- `import.meta.glob` 在建置時期抓取 `regulations/**/*.md`，無需後端
