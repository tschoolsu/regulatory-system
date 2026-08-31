// =============================================================================
// 產生 Open Graph 預覽圖（1200×630 PNG）
//
// 讀取 regulations/**/*.md，為每份法規在 public/og/ 底下產生一張預覽圖，
// 以及一張首頁 / 找不到頁面使用的 default.png。
//
// 字型：從 Google Fonts 下載 Noto Sans TC（woff2），以 wawoff2 解壓成 TTF 餵給
// satori。已下載的字型會快取在 scripts/.fonts/（gitignored）。
//
// 執行：npm run og   （build 指令會自動呼叫）
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import satori from 'satori'
import wawoff2 from 'wawoff2'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REGS_DIR = path.join(ROOT, 'regulations')
const OUT_DIR = path.join(ROOT, 'public', 'og')
const FONTS_DIR = path.join(__dirname, '.fonts')

const WIDTH = 1200
const HEIGHT = 630
const WEIGHTS = [500, 700, 900]

// 色票（與 src/lib/share.ts 的 PALETTE 同步，來源為 index.css 的 OKLCH tokens）
const C = {
  bg: '#FBFCFC',
  fg: '#161818',
  card: '#FFFFFF',
  primary: '#20A089',
  primaryText: '#006857',
  accent: '#1A8385',
  muted: '#606363',
  input: '#CBCECE',
  greenBadge: '#A2ECD9',
}

const UA_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

// -----------------------------------------------------------------------------
// 工具
// -----------------------------------------------------------------------------

function el(type, props, ...children) {
  return React.createElement(type, props, ...children)
}

function slugify(id) {
  return id.replace(/[/\\]/g, '--')
}

function stripExt(file) {
  return file.endsWith('.md') ? file.slice(0, -3) : file
}

function cleanScalar(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized)
  if (!match) return { meta: {}, body: normalized }
  const meta = {}
  let listKey = null
  for (const line of match[1].split('\n')) {
    const listItem = /^\s*-\s+(.*)$/.exec(line)
    if (listItem && listKey) {
      meta[listKey].push(cleanScalar(listItem[1]))
      continue
    }
    const pair = /^([A-Za-z0-9_\-\u4e00-\u9fff]+)\s*:\s*(.*)$/.exec(line)
    if (!pair) continue
    const key = pair[1]
    const value = pair[2].trim()
    listKey = null
    if (value === '') {
      meta[key] = []
      listKey = key
    } else if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => cleanScalar(item))
        .filter((item) => item !== '')
    } else {
      meta[key] = cleanScalar(value)
    }
  }
  return { meta, body: normalized.slice(match[0].length).trimStart() }
}

/** 將 Markdown 內文轉成純文字摘要（與前端 excerptFromBody 邏輯一致） */
function excerptFromBody(body, limit = 110) {
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

/** 依字數估行數截斷，避免超過卡片版面 */
function clampForLines(text, charsPerLine, maxLines) {
  const limit = charsPerLine * maxLines
  if (text.length <= limit) return text
  return text.slice(0, limit - 1).replace(/[，。、；：,\s]*$/, '') + '…'
}

function isValidTtf(buf) {
  const bytes = new Uint8Array(buf)
  const sig = [...bytes.slice(0, 4)]
  return (
    (sig[0] === 0 && sig[1] === 1 && sig[2] === 0 && sig[3] === 0) ||
    (sig[0] === 0x4f && sig[1] === 0x54 && sig[2] === 0x54 && sig[3] === 0x4f) ||
    (sig[0] === 0x74 && sig[1] === 0x72 && sig[2] === 0x75 && sig[3] === 0x65)
  )
}

async function downloadFont(weight) {
  try {
    // 帶上 text 參數，Google Fonts 會回傳完整的單一字型檔案
    const sample = encodeURIComponent(
      '法規系統臺北市數位實驗高級中等學校第五屆學生會組織章程選舉罷免條例 0123456789',
    )
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${sample}&display=swap`
    const css = await (await fetch(url, { headers: { 'User-Agent': UA_CHROME } })).text()
    const match = css.match(/url\(([^)]+)\)/)
    if (!match) throw new Error('找不到字型下載網址')
    const fontUrl = match[1].replace(/["']/g, '')
    return new Uint8Array(await (await fetch(fontUrl)).arrayBuffer())
  } catch (err) {
    console.warn(`[og] 無法下載字型 weight ${weight}：${err.message}`)
    return null
  }
}

async function ensureFonts() {
  fs.mkdirSync(FONTS_DIR, { recursive: true })
  const fonts = []
  for (const weight of WEIGHTS) {
    const file = path.join(FONTS_DIR, `noto-sans-tc-${weight}.woff2`)
    let woff2 = fs.existsSync(file) ? new Uint8Array(fs.readFileSync(file)) : null
    if (!woff2) {
      woff2 = await downloadFont(weight)
      if (woff2) fs.writeFileSync(file, woff2)
    }
    if (!woff2) {
      console.warn(`[og] weight ${weight} 沒有可用字型，跳過`)
      continue
    }
    let ttf = null
    try {
      // wawoff2 會重用同一塊記憶體，多個字型時會互相覆蓋，必須複製一份
      ttf = new Uint8Array(await wawoff2.decompress(woff2)).slice()
    } catch (err) {
      console.warn(`[og] weight ${weight} 字型快取損壞（${err.message}），重新下載`)
    }
    if (ttf && !isValidTtf(ttf)) {
      ttf = null
      console.warn(`[og] weight ${weight} 字型快取無效，重新下載`)
    }
    if (!ttf) {
      fs.rmSync(file, { force: true })
      const fresh = await downloadFont(weight)
      if (!fresh) {
        console.warn(`[og] weight ${weight} 重新下載失敗，跳過`)
        continue
      }
      fs.writeFileSync(file, fresh)
      try {
        ttf = new Uint8Array(await wawoff2.decompress(fresh)).slice()
      } catch (err) {
        console.warn(`[og] weight ${weight} 重新下載的字型仍無法使用：${err.message}`)
        continue
      }
      if (!isValidTtf(ttf)) {
        console.warn(`[og] weight ${weight} 重新下載的字型仍無效，跳過`)
        continue
      }
    }
    fonts.push({ name: 'Noto Sans TC', data: ttf, weight, style: 'normal' })
  }
  return fonts
}

// -----------------------------------------------------------------------------
// 卡片渲染
// -----------------------------------------------------------------------------

function ScaleIcon({ size = 28, color = '#FBFCFC' }) {
  return el(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
    el('path', { d: 'M12 3v18' }),
    el('path', { d: 'M5 21h14' }),
    el('path', { d: 'M12 6 5 8l-2 5a3.5 3.5 0 0 0 7 0l-2-5' }),
    el('path', { d: 'M12 6l7 2 2 5a3.5 3.5 0 0 1-7 0l2-5' }),
  )
}

function TagChip({ text, background = C.card, color = C.fg }) {
  return el(
    'span',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 18px',
        borderRadius: 999,
        border: `2px solid ${C.fg}`,
        background,
        color,
        fontSize: 20,
        fontWeight: 700,
        fontFamily: 'Noto Sans TC',
        whiteSpace: 'nowrap',
      },
    },
    text,
  )
}

/**
 * 與前端 ShareCard.tsx 對應的卡片樣式（兩邊需保持視覺一致）
 */
async function renderCard({ title, breadcrumb, revision, author, tags, excerpt }) {
  const titleLines = clampForLines(title, 17, 2)
  const excerptLines = clampForLines(excerpt, 40, 2)
  const chips = (tags.length > 0 ? tags : []).slice(0, 4)

  const tree = el(
    'div',
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        background: C.bg,
        color: C.fg,
        fontFamily: 'Noto Sans TC',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
    },
    // 背景裝飾
    el('div', { style: { position: 'absolute', left: -70, bottom: -40, width: 220, height: 220, borderRadius: '50%', border: `4px solid ${C.fg}`, opacity: 0.5 } }),
    el('div', { style: { position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: 36, border: `3px solid ${C.fg}`, background: C.primary, boxShadow: '6px 6px 0 0 #161818', opacity: 0.22, transform: 'rotate(-8deg)' } }),

    el(
      'div',
      { style: { position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, padding: '52px 56px 28px' } },
      // Header
      el(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 } },
        el(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 16 } },
          el('div', { style: { width: 52, height: 52, borderRadius: 18, border: `3px solid ${C.fg}`, background: C.primary, boxShadow: '3px 3px 0 0 #161818', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)' } }, el(ScaleIcon, { size: 30 })),
          el(
            'div',
            { style: { fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline' } },
            '法規',
            el('span', { style: { color: C.primaryText, margin: '0 4px' } }, '-'),
            '系統',
          ),
        ),
        el(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 20 } },
          el(
            'div',
            { style: { fontSize: 20, fontWeight: 500, color: C.muted, textAlign: 'right' } },
            '臺北市數位實驗高中 · 第五屆學生會',
          ),
          el(
            'div',
            { style: { width: 62, height: 62, borderRadius: 18, border: `3px solid ${C.fg}`, background: C.fg, color: '#FBFCFC', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(6deg)', flexShrink: 0 } },
            el('span', { style: { fontSize: 30, fontWeight: 900, lineHeight: 1 } }, '§'),
          ),
        ),
      ),
      // 主內容
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center', paddingTop: 30 } },
        breadcrumb
          ? el('div', { style: { fontSize: 22, fontWeight: 500, color: C.muted } }, breadcrumb)
          : null,
        el('div', { style: { fontSize: 60, fontWeight: 900, lineHeight: 1.18, letterSpacing: '-0.01em' } }, titleLines),
        (revision || author)
          ? el(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' } },
              revision ? el(TagChip, { text: `rev ${revision}`, background: C.greenBadge, color: C.primaryText }) : null,
              author ? el(TagChip, { text: author }) : null,
            )
          : null,
        el('div', { style: { fontSize: 24, fontWeight: 500, lineHeight: 1.55, color: C.muted } }, excerptLines),
      ),
    ),
    // Footer
    el(
      'div',
      { style: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '18px 56px', borderTop: `3px solid ${C.fg}`, background: C.primary } },
      el(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 } },
        chips.length > 0
          ? chips.map((tag) => el(TagChip, { key: tag, text: tag, background: '#FFFFFF' }))
          : el('span', { style: { fontSize: 20, fontWeight: 700, color: '#FBFCFC' } }, '線上查閱完整法規'),
      ),
      el(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 900, color: '#FBFCFC' } },
        '查看全文',
        el('span', { style: { fontSize: 26 } }, '→'),
      ),
    ),
  )

  return satori(tree, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  })
}

// -----------------------------------------------------------------------------
// 主要流程
// -----------------------------------------------------------------------------

function collectDocs() {
  const docs = []
  const walk = (dir, categories) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant-TW'))) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, [...categories, entry.name])
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const source = fs.readFileSync(full, 'utf8')
        const { meta, body } = parseFrontmatter(source)
        const fileName = stripExt(entry.name)
        docs.push({
          id: [...categories, fileName].join('/'),
          categories,
          fileName,
          title: typeof meta.title === 'string' && meta.title !== '' ? meta.title : fileName,
          revision: typeof meta.revision === 'string' ? meta.revision : '',
          tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
          author: typeof meta.author === 'string' ? meta.author : undefined,
          body,
        })
      }
    }
  }
  walk(REGS_DIR, [])
  docs.sort((a, b) => a.id.localeCompare(b.id, 'zh-Hant-TW'))
  return docs
}

function breadcrumbFor(doc) {
  return doc.categories.length > 0 ? `${doc.categories.join(' › ')}` : ''
}

async function main() {
  console.log('[og] 產生 Open Graph 預覽圖 …')
  fonts = await ensureFonts()
  if (fonts.length === 0) {
    console.warn('[og] 沒有任何可用字型（離線？），跳過預覽圖產生。')
    return
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const file of fs.readdirSync(OUT_DIR)) {
    fs.rmSync(path.join(OUT_DIR, file), { force: true })
  }

  const docs = collectDocs()
  const siteDesc =
    '學生會所有章程、校規與行政要點的線上查閱入口，內容由學生會依最新決議即時更新。'

  const tasks = [
    {
      file: 'default.png',
      data: {
        title: '法規-系統',
        breadcrumb: '臺北市數位實驗高中 · 第五屆學生會',
        revision: '',
        author: '',
        tags: ['線上查閱', `${docs.length} 份法規`],
        excerpt: siteDesc,
      },
    },
    ...docs.map((doc) => ({
      file: `${slugify(doc.id)}.png`,
      data: {
        title: doc.title,
        breadcrumb: breadcrumbFor(doc),
        revision: doc.revision,
        author: doc.author ?? '',
        tags: doc.tags,
        excerpt: excerptFromBody(doc.body),
      },
    })),
  ]

  let ok = 0
  for (const task of tasks) {
    try {
      const svg = await renderCard(task.data)
      const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
      fs.writeFileSync(path.join(OUT_DIR, task.file), png)
      ok += 1
      console.log(`[og] ✓ ${task.file}`)
    } catch (err) {
      console.warn(`[og] ✗ ${task.file} 產生失敗：${err.message}`)
    }
  }

  console.log(`[og] 完成：${ok}/${tasks.length} 張預覽圖已產生到 public/og/`)
}

let fonts = []
main().catch((err) => {
  console.error('[og] 產生過程發生錯誤：', err)
  process.exit(1)
})
