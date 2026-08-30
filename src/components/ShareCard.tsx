import type { CSSProperties } from 'react'
import type { Doc } from '../lib/docs'
import { PALETTE } from '../lib/share'
import { ScaleIcon } from './Icons'

const WIDTH = 1200
const HEIGHT = 630

interface ShareCardProps {
  doc: Doc | null
  excerpt: string
}

const tag: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 18px',
  borderRadius: 999,
  border: `2px solid ${PALETTE.fg}`,
  background: PALETTE.card,
  color: PALETTE.fg,
  fontSize: 20,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
}

/**
 * 分享預覽卡片（1200×630），與 scripts/gen-og.mjs 產出的 PNG 保持視覺一致。
 * 用於 #/share/<id> 頁面，也是「下載 PNG」的截圖來源。
 */
function ShareCard({ doc, excerpt }: ShareCardProps) {
  const title = doc?.title ?? '法規-系統'
  const breadcrumb = doc && doc.categories.length > 0 ? doc.categories.join(' › ') : ''
  const revision = doc?.revision ?? ''
  const author = doc?.author
  const tags = doc ? doc.tags.slice(0, 4) : []

  return (
    <div
      data-share-card
      className="share-card"
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: PALETTE.bg,
        color: PALETTE.fg,
        fontFamily: "'Noto Sans TC', 'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 背景裝飾 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -70,
          bottom: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: `4px solid ${PALETTE.fg}`,
          opacity: 0.5,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 150,
          height: 150,
          borderRadius: 36,
          border: `3px solid ${PALETTE.fg}`,
          background: PALETTE.primary,
          boxShadow: '6px 6px 0 0 #161818',
          opacity: 0.22,
          transform: 'rotate(-8deg)',
        }}
      />

      {/* 內容 */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '52px 56px 28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                display: 'flex',
                width: 52,
                height: 52,
                borderRadius: 18,
                border: `3px solid ${PALETTE.fg}`,
                background: PALETTE.primary,
                boxShadow: '3px 3px 0 0 #161818',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-4deg)',
                color: PALETTE.bg,
              }}
            >
              <ScaleIcon className="h-8 w-8" />
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              法規<span style={{ color: PALETTE.primaryText, margin: '0 4px' }}>-</span>系統
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: PALETTE.muted, textAlign: 'right' }}>
              臺北市數位實驗高中 · 第五屆學生會
            </div>
            <span
              aria-hidden
              style={{
                display: 'flex',
                width: 62,
                height: 62,
                borderRadius: 18,
                border: `3px solid ${PALETTE.fg}`,
                background: PALETTE.fg,
                color: PALETTE.bg,
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(6deg)',
                flexShrink: 0,
                fontSize: 30,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              §
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
            justifyContent: 'center',
            paddingTop: 30,
            minHeight: 0,
          }}
        >
          {breadcrumb !== '' && (
            <div style={{ fontSize: 22, fontWeight: 500, color: PALETTE.muted }}>{breadcrumb}</div>
          )}
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </div>
          {(revision !== '' || author !== undefined) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {revision !== '' && (
                <span style={{ ...tag, background: PALETTE.greenBadge, color: PALETTE.primaryText }}>
                  rev {revision}
                </span>
              )}
              {author !== undefined && <span style={tag}>{author}</span>}
            </div>
          )}
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.55,
              color: PALETTE.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {excerpt}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '18px 56px',
          borderTop: `3px solid ${PALETTE.fg}`,
          background: PALETTE.primary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {tags.length > 0 ? (
            tags.map((item) => (
              <span key={item} style={tag}>
                {item}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: PALETTE.bg }}>線上查閱完整法規</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 24,
            fontWeight: 900,
            color: PALETTE.bg,
            flexShrink: 0,
          }}
        >
          查看全文<span style={{ fontSize: 26 }}>→</span>
        </div>
      </div>
    </div>
  )
}

export default ShareCard
