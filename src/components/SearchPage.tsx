import { useState } from 'react'
import { Button } from 'tpass-ui'
import { searchDocs } from '../lib/docs'
import { hrefDoc } from '../lib/router'
import { FileIcon } from './Icons'
import LinkButton from './LinkButton'

function highlight(text: string, query: string): React.ReactNode[] {
  const keyword = query.trim()
  if (keyword === '') return [text]
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={index} className="rounded-[0.3em] bg-primary/30 px-[0.2em]">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function SearchPage({ query }: { query: string }) {
  const [keyword, setKeyword] = useState(query)
  const hits = searchDocs(query)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="m-0 mb-3.5">
        搜尋法規<span className="text-primary">-</span>
      </h1>
      <form
        className="flex w-full max-w-[34rem] items-center gap-2 rounded-2xl border-2 border-foreground bg-card p-1.5 pl-4 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 focus-within:-translate-y-0.5 focus-within:shadow-[7px_7px_0_0_var(--color-foreground)]"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          window.location.hash = `#/search?q=${encodeURIComponent(keyword.trim())}`
        }}
      >
        <input
          type="search"
          value={keyword}
          autoFocus
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="輸入關鍵字搜尋標題、標籤與內文…"
          aria-label="搜尋法規"
          className="min-w-0 flex-1 border-none bg-transparent text-base font-medium outline-none"
        />
        <Button type="submit" variant="primary">
          搜尋
        </Button>
      </form>

      {query.trim() !== '' && (
        <p className="mt-4 text-sm text-muted-foreground">
          找到 <strong>{hits.length}</strong> 份與「{query}」相關的法規
        </p>
      )}

      <ul className="m-0 mt-4 grid list-none gap-3 p-0">
        {hits.map(({ doc, snippet }) => (
          <li key={doc.id}>
            <a
              className="flex items-start gap-3.5 rounded-xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-foreground)]"
              href={hrefDoc(doc.id)}
            >
              <FileIcon className="h-5 w-5 shrink-0 text-accent" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-bold break-words">{highlight(doc.title, query)}</span>
                <span className="text-sm text-muted-foreground">{snippet}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {doc.categories.join(' › ') || '根目錄'}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {query.trim() !== '' && hits.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border-2 border-foreground bg-card p-9 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
          <h2 className="m-0">沒有找到符合的結果</h2>
          <p className="m-0 text-sm text-muted-foreground">試試其他關鍵字，或瀏覽首頁的分類總覽。</p>
          <LinkButton href="#/">回首頁</LinkButton>
        </div>
      )}
    </div>
  )
}

export default SearchPage
