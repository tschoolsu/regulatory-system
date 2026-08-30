import type { Doc } from './docs'
import { folderByPath, getDoc, stats } from './docs'
import { hrefDoc } from './router'
import type { Route } from './router'

// 色票（與 scripts/gen-og.mjs 的 C 同步，來源為 index.css 的 OKLCH tokens）
export const PALETTE = {
  bg: '#FBFCFC',
  fg: '#161818',
  card: '#FFFFFF',
  primary: '#20A089',
  primaryFg: '#FCFCFC',
  primaryText: '#006857',
  accent: '#1A8385',
  muted: '#606363',
  input: '#CBCECE',
  greenBadge: '#A2ECD9',
} as const

export const SITE_TITLE = '法規系統 - 臺北市數位實驗高中第五屆學生會'
export const SITE_DESCRIPTION =
  '學生會所有章程、校規與行政要點的線上查閱入口，內容由學生會依最新決議即時更新。'

/** 與 scripts/gen-og.mjs 的 slugify 相同：分類路徑以 `--` 串接 */
export function ogSlug(id: string): string {
  return id.replace(/[/\\]/g, '--')
}

/** 站台根路徑（不含 hash，不含尾端斜線），例如 https://user.github.io/repo */
export function siteBase(): string {
  return `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`
}

/** 某份法規的 og:image 絕對網址 */
export function ogImageUrl(id: string): string {
  return `${siteBase()}/og/${ogSlug(id)}.png`
}

export function defaultOgImageUrl(): string {
  return `${siteBase()}/og/default.png`
}

/** 給定 hash 路由（如 `/doc/...`）回傳絕對網址 */
export function canonicalUrl(hashPath: string): string {
  return `${siteBase()}/#${hashPath}`
}

/** 將 Markdown 內文轉成純文字摘要（與 scripts/gen-og.mjs 的 excerptFromBody 相同） */
export function excerptFromBody(body: string, limit = 110): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\[TOC\]\s*$/gm, ' ')
    .replace(/^:::[a-z]+\s*.*$/gim, ' ')
    .replace(/^> \[![^\]]*\][^\n]*$/gim, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\^\s*\[\d+\]/g, ' ')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/^\s*[-=]{3,}\s*$/gm, ' ')
    .replace(/[#*_`~>]/g, ' ')
    .replace(/^\s*[-+]\s+/gm, ' ')
    .replace(/^\s*\d+\s*[.)]\s+/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= limit) return plain
  return plain.slice(0, limit).replace(/[，。、；：,\s]*$/, '') + '…'
}

export function docExcerpt(doc: Doc): string {
  return excerptFromBody(doc.body)
}

export interface ShareMeta {
  title: string
  description: string
  url: string
  image: string
  type: 'website' | 'article'
}

function homeMeta(): ShareMeta {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: canonicalUrl('/'),
    image: defaultOgImageUrl(),
    type: 'website',
  }
}

function docMeta(doc: Doc): ShareMeta {
  const description = docExcerpt(doc) || `${doc.categories.join(' › ') || '法規系統'} · revision ${doc.revision || '未標記'}`
  return {
    title: `${doc.title} - 法規系統`,
    description,
    url: canonicalUrl(hrefDoc(doc.id)),
    image: ogImageUrl(doc.id),
    type: 'article',
  }
}

/** 依目前路由計算該頁面的分享 meta（title / description / url / image） */
export function metaFor(route: Route): ShareMeta {
  switch (route.name) {
    case 'home':
      return homeMeta()
    case 'doc': {
      const doc = getDoc(route.id)
      if (!doc) return homeMeta()
      return docMeta(doc)
    }
    case 'share': {
      const doc = getDoc(route.id)
      if (!doc) return homeMeta()
      return docMeta(doc)
    }
    case 'cat': {
      const folder = folderByPath(route.segments)
      const name = folder?.name ?? route.segments[route.segments.length - 1] ?? '分類'
      const description = folder
        ? `${folder.count} 份法規，依法規性質分類整理，點擊查看全文。`
        : '此分類下目前沒有法規。'
      return {
        title: `${name} - 法規系統`,
        description,
        url: canonicalUrl(`/cat/${route.segments.map((s) => encodeURIComponent(s)).join('/')}`),
        image: defaultOgImageUrl(),
        type: 'website',
      }
    }
    case 'search': {
      const keyword = route.query.trim()
      const description =
        keyword === '' ? SITE_DESCRIPTION : `搜尋「${keyword}」的結果 — 在 ${stats.docs} 份法規中查找標題、標籤與內文。`
      return {
        title: keyword === '' ? SITE_TITLE : `搜尋「${keyword}」 - 法規系統`,
        description,
        url: canonicalUrl(`/search?q=${encodeURIComponent(keyword)}`),
        image: defaultOgImageUrl(),
        type: 'website',
      }
    }
  }
}
