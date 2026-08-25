import { useState } from 'react'
import { hrefHome } from '../lib/router'
import { SearchIcon, ScaleIcon } from './Icons'

function Header() {
  const [query, setQuery] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const keyword = query.trim()
    if (keyword === '') return
    window.location.hash = `#/search?q=${encodeURIComponent(keyword)}`
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href={hrefHome()}>
          <span className="logo-badge">
            <ScaleIcon className="h-5 w-5" />
          </span>
          <span className="logo-text">
            法規<span className="hyphen">-</span>系統
          </span>
        </a>

        <form className="header-search" onSubmit={submit} role="search">
          <SearchIcon className="search-glyph h-4 w-4" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋法規關鍵字…"
            aria-label="搜尋法規"
          />
          <button type="submit">搜尋</button>
        </form>
      </div>
    </header>
  )
}

export default Header
