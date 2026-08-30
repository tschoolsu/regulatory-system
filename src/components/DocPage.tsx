import { useEffect, useRef, useState } from 'react'
import { flatDocIds, getDoc, tree } from '../lib/docs'
import { renderMarkdown } from '../lib/markdown'
import { hrefCat, hrefDoc, hrefShare } from '../lib/router'
import Breadcrumbs from './Breadcrumbs'
import { ShareIcon } from './Icons'
import TreeNav from './TreeNav'

interface TocItem {
  id: string
  text: string
  level: number
}

function DocPage({ id }: { id: string }) {
  const doc = getDoc(id)
  const [html, setHtml] = useState('')
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [sideCollapsed, setSideCollapsed] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!doc) return
    let cancelled = false
    setHtml('')
    setHeadings([])
    renderMarkdown(doc.body).then((output) => {
      if (!cancelled) setHtml(output)
    })
    return () => {
      cancelled = true
    }
  }, [doc])

  useEffect(() => {
    if (html === '' || !articleRef.current) return
    const el = articleRef.current

    const items: TocItem[] = []
    for (const heading of Array.from(el.querySelectorAll('h2[id], h3[id], h4[id]'))) {
      items.push({
        id: heading.id,
        text: heading.textContent ?? '',
        level: Number(heading.tagName.slice(1)),
      })
    }
    setHeadings(items)

    // 等 setState 造成的重新渲染結束後再進行命令式 DOM 操作，避免被 React 覆寫
    const frame = requestAnimationFrame(() => {
      const node = articleRef.current
      if (!node) return
      const holder = node.querySelector('#md-toc')
      if (holder) {
        holder.replaceChildren(buildTocList(items))
      }
      const mermaidBlocks = Array.from(node.querySelectorAll('code.language-mermaid'))
      if (mermaidBlocks.length > 0) {
        void renderMermaid(mermaidBlocks)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [html])

  if (!doc) {
    return (
      <div className="container section">
        <div className="notfound-card">
          <span className="tag tag-rose">404</span>
          <h1>找不到這份法規</h1>
          <p className="muted">路徑「{id}」不存在，可能已被修訂或移除。</p>
          <a className="btn btn-primary" href="#/">
            回首頁
          </a>
        </div>
      </div>
    )
  }

  const ids = flatDocIds()
  const position = ids.indexOf(doc.id)
  const prev = position > 0 ? getDoc(ids[position - 1]) : undefined
  const next = position >= 0 && position < ids.length - 1 ? getDoc(ids[position + 1]) : undefined

  return (
    <div className="container section">
      <Breadcrumbs path={doc.categories} current={doc.title} />

      <details className="doc-mobile-nav">
        <summary>法規目錄</summary>
        <TreeNav nodes={tree} activeId={doc.id} />
      </details>

      <div className={`doc-layout${sideCollapsed ? ' doc-layout-side-collapsed' : ''}`}>
        <aside className={`doc-side${sideCollapsed ? ' is-collapsed' : ''}`}>
          <button
            type="button"
            className="side-toggle"
            aria-expanded={!sideCollapsed}
            onClick={() => setSideCollapsed((collapsed) => !collapsed)}
          >
            <span className="side-title">全部法規</span>
            <span className="side-toggle-icon" aria-hidden="true">
              {sideCollapsed ? '›' : '‹'}
            </span>
          </button>
          {!sideCollapsed && <TreeNav nodes={tree} activeId={doc.id} />}
        </aside>

        <article className="doc-main" ref={articleRef}>
          <header className="doc-header">
            <h1>{doc.title}</h1>
            <div className="doc-meta">
              <span className="tag tag-green">revision {doc.revision !== '' ? doc.revision : '未標記'}</span>
              {doc.author !== undefined && <span className="tag">{doc.author}</span>}
              {doc.tags.map((tag) => (
                <a key={tag} className="tag tag-accent" href={`#/search?q=${encodeURIComponent(tag)}`}>
                  #{tag}
                </a>
              ))}
            </div>
            <div className="doc-share-row">
              <a className="btn btn-sm" href={hrefShare(doc.id)}>
                <ShareIcon className="h-4 w-4" /> 分享預覽
              </a>
            </div>
          </header>
          {/* eslint-disable-next-line react/no-danger */}
          <div className="prose-md" dangerouslySetInnerHTML={{ __html: html }} />

          <nav className="doc-pager">
            {prev ? (
              <a className="pager-link pager-prev" href={hrefDoc(prev.id)}>
                <span className="muted small">← 上一篇</span>
                <strong>{prev.title}</strong>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="pager-link pager-next" href={hrefDoc(next.id)}>
                <span className="muted small">下一篇 →</span>
                <strong>{next.title}</strong>
              </a>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <aside className="doc-toc">
          {headings.length > 0 && (
            <>
              <p className="side-title">本頁目錄</p>
              {buildReactToc(headings)}
            </>
          )}
          <p className="side-title toc-gap">所在分類</p>
          <ul className="cat-links">
            {doc.categories.map((segment, index) => (
              <li key={`${segment}-${index}`}>
                <a href={hrefCat(doc.categories.slice(0, index + 1))}>{segment}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

async function renderMermaid(blocks: Element[]): Promise<void> {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'strict',
    fontFamily: 'ui-monospace, monospace',
  })
  const stamp = Date.now()
  for (const [index, block] of blocks.entries()) {
    const source = block.textContent ?? ''
    try {
      const { svg } = await mermaid.render(`mmd-${stamp}-${index}`, source)
      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-figure'
      wrapper.innerHTML = svg
      block.closest('pre')?.replaceWith(wrapper)
    } catch (error) {
      const pre = block.closest('pre')
      if (pre) {
        const note = document.createElement('p')
        note.className = 'mermaid-error'
        note.textContent = error instanceof Error ? error.message : 'Mermaid 圖表無法渲染'
        pre.after(note)
      }
    }
  }
}

function buildTocList(items: TocItem[]): HTMLUListElement {
  const list = document.createElement('ul')
  list.className = 'toc-list'
  for (const item of items) {
    const li = document.createElement('li')
    if (item.level >= 3) li.className = 'toc-l3'
    const anchor = document.createElement('a')
    anchor.textContent = item.text
    anchor.addEventListener('click', (event) => {
      event.preventDefault()
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    li.appendChild(anchor)
    list.appendChild(li)
  }
  return list
}

function buildReactToc(items: TocItem[]) {
  const scrollTo = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault()
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <ul className="toc-list page-toc">
      {items.map((item) => (
        <li key={item.id} className={item.level >= 3 ? 'toc-l3' : ''}>
          <a href={`#${item.id}`} onClick={(event) => scrollTo(event, item.id)}>
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default DocPage
