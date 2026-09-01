# tpass-regulatory（法規系統）

## 生態系地圖在上層

本 repo 是 **tpass 生態系**的一個服務（id：`law`），公開網域 `law.tschoolsu.org`。
整個生態系的地圖、跨服務規範、`services.json` 註冊表、`tpass` CLI 與部署流程，
都在上層 **tpass-ops** repo 的 `AGENTS.md` 與 `docs/`。動跨服務的東西前先讀那邊。

## 這個服務跟其他六個消費端不一樣

- **不是 Next.js**，是 Vite + React 19 的純前端 SPA。沒有 `node_modules/next`，
  「Next.js 版本可能跟你的訓練資料不同」那套警告不適用這裡。
- **不接 SSO**，公開網站、不需要登入。純前端 SPA 本來就接不了 T-Pass 的登入
  （token 是 HttpOnly cookie，驗章要在後端做，見 `tpass-auth/INTEGRATION.md §6`）——
  這個服務刻意選擇「維持公開」而不是「加一層薄後端」，不要幫它加登入。
- **不託管在主機上**，部署在 GitHub Pages（`.github/workflows/deploy.yml`），
  `tpass-registry/services.json` 裡這條的 `hosting` 是 `"external"`、`port` 是 `null`。
  `pm2` / `deploy.sh` 不會碰它，`tpass status` 也不會把它當成掛掉的服務。
- 內容在 **build 時**打包進 bundle（`src/lib/docs.ts` 的 `import.meta.glob(..., {eager: true})`），
  改法規要重新 build + 重新部署，不是 runtime 讀檔。

## 開發

- 套件管理一律 **pnpm**（`pnpm add` / `pnpm install`），不要用 npm/yarn，不要生出
  `package-lock.json`。
- `pnpm dev` / `pnpm build` / `pnpm lint`（`oxlint`）/ `pnpm exec tsc --noEmit`。
- UI 走 Tailwind v4 + **`tpass-ui`**（`github:tschoolsu/tpass-ui#v1.0.0`，釘 tag、不用 `#main`）。
  按鈕/輸入框/卡片/badge 改去 `tpass-ui` 改，不要在這裡復活一份手刻 primitives。
  `src/index.css` 只留兩類東西：全站 reset、以及 markdown pipeline 在 runtime 產生的
  HTML 才需要的樣式（`.prose-md` / `.callout`）跟遞迴的樹狀導覽 / 麵包屑
  （Tailwind 靜態掃描碰不到，或用 utility 表達反而更難讀）。其餘一律 Tailwind utility。
- `tpass-ui/theme.css` 的字體 token 預設接 Next.js 的 `--font-geist-*`，這個專案沒有那組
  變數，`src/index.css` 開頭用 `@theme` 補了 fallback——這個覆蓋不要刪。

## 安全紅線

- `src/components/DocPage.tsx` 用 `dangerouslySetInnerHTML` 灌入 markdown 渲染結果，
  `rehype-stringify` 沒有開 sanitize。**目前風險可控**，因為法規內容全部來自
  `regulations/` 底下受版控的 `.md` 檔，改動要走 PR。**如果日後要開放外部投稿
  或任何非受控來源寫入 `regulations/`，這裡必須先加 sanitize（例如 `rehype-sanitize`）
  再合併**，否則就是儲存型 XSS。
