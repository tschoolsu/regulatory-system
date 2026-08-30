import { useEffect, useRef, useState } from 'react'
import { getDoc } from '../lib/docs'
import { hrefDoc, hrefShare } from '../lib/router'
import { canonicalUrl, docExcerpt, ogImageUrl, ogSlug, siteBase } from '../lib/share'
import ShareCard from './ShareCard'

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630

function useScale() {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const update = () => {
      setScale(Math.min(1, frame.clientWidth / CARD_WIDTH))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])
  return { frameRef, scale }
}

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
  return Promise.resolve()
}

async function downloadCardPng(node: HTMLElement, filename: string): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  const body = new XMLSerializer().serializeToString(node)
  node.removeAttribute('xmlns')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}"><foreignObject width="100%" height="100%">${body}</foreignObject></svg>`
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('render failed'))
    img.src = url
  })
  ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT)
  URL.revokeObjectURL(url)
  canvas.toBlob((blob) => {
    if (!blob) return
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }, 'image/png')
}

function SharePage({ id }: { id: string }) {
  const doc = getDoc(id)
  const { frameRef, scale } = useScale()
  const [copied, setCopied] = useState(false)
  const [imageOk, setImageOk] = useState(true)

  const shareUrl = doc ? canonicalUrl(hrefDoc(doc.id)) : siteBase()
  const imageUrl = doc ? ogImageUrl(doc.id) : `${siteBase()}/og/default.png`

  useEffect(() => {
    if (!doc) return
    const img = new Image()
    img.onload = () => setImageOk(true)
    img.onerror = () => setImageOk(false)
    img.src = imageUrl
  }, [doc, imageUrl])

  if (!doc) {
    return (
      <div className="container section">
        <div className="notfound-card">
          <span className="tag tag-rose">404</span>
          <h1>找不到這份法規</h1>
          <p className="muted">路徑「{id}」不存在，無法產生分享預覽。</p>
          <a className="btn btn-primary" href="#/">
            回首頁
          </a>
        </div>
      </div>
    )
  }

  const handleCopy = async () => {
    await copyText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const handleDownload = async () => {
    const node = document.querySelector<HTMLElement>('[data-share-card]')
    if (!node) return
    try {
      await downloadCardPng(node, `og-${ogSlug(doc.id)}.png`)
    } catch {
      window.alert('無法產生圖片，請改用較新的 Chrome、Edge 或 Firefox 瀏覽器。')
    }
  }

  return (
    <div className="container section share-page">
      <div className="share-head">
        <div>
          <span className="tag tag-accent">分享預覽</span>
          <h1>{doc.title}</h1>
          <p className="muted">這份預覽卡會以分享圖片的樣式出現在社群平台（Discord、LINE、Facebook 等）。</p>
        </div>
        <a className="btn" href={hrefDoc(doc.id)}>
          ← 回到法規
        </a>
      </div>

      <div className="share-frame" ref={frameRef}>
        <div style={{ height: CARD_HEIGHT * scale, position: 'relative' }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
          >
            <ShareCard doc={doc} excerpt={docExcerpt(doc)} />
          </div>
        </div>
      </div>

      <div className="share-actions">
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          {copied ? '已複製連結 ✓' : '複製分享連結'}
        </button>
        <button type="button" className="btn" onClick={handleDownload}>
          下載預覽圖片 PNG
        </button>
        <a className="btn" href={imageUrl} target="_blank" rel="noopener noreferrer">
          新分頁開啟預覽圖 ↗
        </a>
      </div>

      {!imageOk && (
        <p className="share-hint">
          本機尚未產生這張預覽圖。執行 <code>npm run og</code>（或建置 <code>npm run build</code>）後，
          預覽圖會產生在 <code>public/og/</code>。
        </p>
      )}

      <section className="share-meta">
        <h2>社群分享資訊</h2>
        <dl className="share-meta-list">
          <div>
            <dt>標題（og:title）</dt>
            <dd>{doc.title} - 法規系統</dd>
          </div>
          <div>
            <dt>說明（og:description）</dt>
            <dd>{docExcerpt(doc)}</dd>
          </div>
          <div>
            <dt>分享網址</dt>
            <dd className="mono">{shareUrl}</dd>
          </div>
          <div>
            <dt>預覽圖（og:image）</dt>
            <dd className="mono">{imageUrl}</dd>
          </div>
        </dl>
        <p className="muted small">
          這個分享預覽頁面的網址是：
          <a href={hrefShare(doc.id)}>{`#${hrefShare(doc.id)}`}</a>
        </p>
      </section>
    </div>
  )
}

export default SharePage
