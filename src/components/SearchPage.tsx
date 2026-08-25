import { useState } from 'react'
import { searchDocs } from '../lib/docs'
import { hrefDoc } from '../lib/router'
import { FileIcon } from './Icons'

function highlight(text: string, query: string): React.ReactNode[] {
  const keyword = query.trim()
  if (keyword === '') return [text]
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? <mark key={index}>{part}</mark> : part,
  )
}

function SearchPage({ query }: { query: string }) {
  const [keyword, setKeyword] = useState(query)
  const hits = searchDocs(query)

  return (
    <div className="container section search-page">
      <h1 className="page-title">
        搜尋法規<span className="hyphen">-</span>
      </h1>
      <form
        className="hero-search"
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
        />
        <button type="submit" className="btn btn-primary">
          搜尋
        </button>
      </form>

      {query.trim() !== '' && (
        <p className="muted result-count">
          找到 <strong>{hits.length}</strong> 份與「{query}」相關的法規
        </p>
      )}

      <ul className="recent-list">
        {hits.map(({ doc, snippet }) => (
          <li key={doc.id}>
            <a className="recent-row recent-row-tall" href={hrefDoc(doc.id)}>
              <FileIcon className="recent-icon h-5 w-5" />
              <span className="recent-stack">
                <span className="recent-title">{highlight(doc.title, query)}</span>
                <span className="muted small">{snippet}</span>
              </span>
              <span className="tag tone-tag tone-neutral mono">{doc.categories.join(' › ') || '根目錄'}</span>
            </a>
          </li>
        ))}
      </ul>

      {query.trim() !== '' && hits.length === 0 && (
        <div className="notfound-card">
          <h2>沒有找到符合的結果</h2>
          <p className="muted">試試其他關鍵字，或瀏覽首頁的分類總覽。</p>
          <a className="btn btn-primary" href="#/">
            回首頁
          </a>
        </div>
      )}
    </div>
  )
}

export default SearchPage
