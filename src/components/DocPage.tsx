import { useEffect, useRef, useState } from 'react'
import { flatDocIds, getDoc, tree } from '../lib/docs'
import { renderMarkdown } from '../lib/markdown'
import { hrefCat, hrefDoc } from '../lib/router'
import Breadcrumbs from './Breadcrumbs'
import LinkButton from './LinkButton'
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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[30rem] flex-col items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-9 text-center shadow-[4px_4px_0_0_var(--color-destructive)]">
          <span className="rounded-md border-2 border-foreground bg-tone-rose-bg px-2 py-0.5 font-mono text-[11px] font-bold text-tone-rose-text">
            404
          </span>
          <h1 className="m-0">找不到這份法規</h1>
          <p className="m-0 text-sm text-muted-foreground">路徑「{id}」不存在，可能已被修訂或移除。</p>
          <LinkButton href="#/">回首頁</LinkButton>
        </div>
      </div>
    )
  }

  const ids = flatDocIds()
  const position = ids.indexOf(doc.id)
  const prev = position > 0 ? getDoc(ids[position - 1]) : undefined
  const next = position >= 0 && position < ids.length - 1 ? getDoc(ids[position + 1]) : undefined

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs path={doc.categories} current={doc.title} />

      <details className="doc-mobile-nav mb-4 overflow-hidden rounded-xl border-2 border-foreground bg-card shadow-[3px_3px_0_0_var(--color-foreground)] lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-2.5 font-extrabold select-none">法規目錄</summary>
        <div className="px-4 pb-3">
          <TreeNav nodes={tree} activeId={doc.id} />
        </div>
      </details>

      <div
        className={
          sideCollapsed
            ? 'mt-1 grid grid-cols-1 items-start gap-6 lg:grid-cols-[3.25rem_minmax(0,1fr)_13rem] xl:grid-cols-[3.25rem_minmax(0,1fr)_14rem]'
            : 'mt-1 grid grid-cols-1 items-start gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)_13rem] xl:grid-cols-[17.5rem_minmax(0,1fr)_14rem]'
        }
      >
        <aside className="sticky top-20 hidden max-h-[calc(100vh-6.5rem)] overflow-y-auto lg:block">
          <button
            type="button"
            aria-expanded={!sideCollapsed}
            onClick={() => setSideCollapsed((collapsed) => !collapsed)}
            className={
              sideCollapsed
                ? 'flex w-full flex-col items-center gap-1 border-0 bg-transparent p-2.5 text-left [font:inherit]'
                : 'flex w-full items-center justify-between gap-1.5 border-0 bg-transparent p-0 text-left [font:inherit]'
            }
          >
            <span
              className={
                sideCollapsed
                  ? 'm-0 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase [writing-mode:vertical-rl]'
                  : 'm-0 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase'
              }
            >
              全部法規
            </span>
            <span
              aria-hidden="true"
              className={`shrink-0 font-mono text-base leading-none text-muted-foreground transition-transform duration-150 ${sideCollapsed ? 'rotate-180' : ''}`}
            >
              {sideCollapsed ? '›' : '‹'}
            </span>
          </button>
          {!sideCollapsed && <TreeNav nodes={tree} activeId={doc.id} />}
        </aside>

        <article ref={articleRef}>
          <header className="mb-5 border-b-2 border-dashed border-foreground/30 pb-4">
            <h1 className="m-0 mb-2.5 text-[clamp(1.6rem,4vw,2.2rem)]">{doc.title}</h1>
            <p className="m-0 mb-2 font-mono text-xs text-muted-foreground">
              revision {doc.revision !== '' ? doc.revision : '未標記'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {doc.author !== undefined && (
                <span className="rounded-md border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                  {doc.author}
                </span>
              )}
              {doc.tags.map((tag) => (
                <a
                  key={tag}
                  className="rounded-md border-2 border-foreground bg-[color-mix(in_oklch,var(--color-accent)_12%,var(--color-card))] px-2 py-0.5 font-mono text-[11px] font-bold text-accent"
                  href={`#/search?q=${encodeURIComponent(tag)}`}
                >
                  #{tag}
                </a>
              ))}
            </div>
          </header>
          {/* eslint-disable-next-line react/no-danger */}
          <div className="prose-md" dangerouslySetInnerHTML={{ __html: html }} />

          <nav className="mt-9 grid grid-cols-2 gap-3.5">
            {prev ? (
              <a
                className="flex flex-col gap-0.5 overflow-hidden rounded-xl border-2 border-foreground bg-card p-3.5 shadow-[2px_2px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-foreground)]"
                href={hrefDoc(prev.id)}
              >
                <span className="text-sm text-muted-foreground">← 上一篇</span>
                <strong>{prev.title}</strong>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a
                className="flex flex-col gap-0.5 overflow-hidden rounded-xl border-2 border-foreground bg-card p-3.5 text-right shadow-[2px_2px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-foreground)]"
                href={hrefDoc(next.id)}
              >
                <span className="text-sm text-muted-foreground">下一篇 →</span>
                <strong>{next.title}</strong>
              </a>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <aside className="sticky top-20 hidden max-h-[calc(100vh-6.5rem)] overflow-y-auto text-sm lg:block">
          {headings.length > 0 && (
            <>
              <p className="m-0 mb-2 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">本頁目錄</p>
              {buildReactToc(headings)}
            </>
          )}
          <p className="m-0 mt-6 mb-2 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">所在分類</p>
          <ul className="m-0 flex flex-wrap gap-1.5 p-0">
            {doc.categories.map((segment, index) => (
              <li key={`${segment}-${index}`} className="list-none">
                <a
                  className="rounded-md border-2 border-foreground bg-secondary px-2 py-0.5 font-mono text-[11px] font-bold"
                  href={hrefCat(doc.categories.slice(0, index + 1))}
                >
                  {segment}
                </a>
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
