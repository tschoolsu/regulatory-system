import { useState } from 'react'
import { Button } from 'tpass-ui'
import { hrefHome } from '../lib/router'
import { SearchIcon } from './Icons'
import PortalLink from './PortalLink'

function Header() {
  const [query, setQuery] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const keyword = query.trim()
    if (keyword === '') return
    window.location.hash = `#/search?q=${encodeURIComponent(keyword)}`
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b-2 border-foreground/20 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <PortalLink />
          <a
            className="whitespace-nowrap font-mono text-lg font-extrabold tracking-tight text-foreground"
            href={hrefHome()}
          >
            T<span className="text-primary">-</span>Law
          </a>
        </div>

        <form
          className="hidden items-center gap-2 rounded-xl border-2 border-foreground bg-card px-3 py-1.5 shadow-[2px_2px_0_0_var(--color-foreground)] transition-all duration-200 focus-within:shadow-[4px_4px_0_0_var(--color-primary)] md:flex"
          onSubmit={submit}
          role="search"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋法規關鍵字…"
            aria-label="搜尋法規"
            className="w-[min(20rem,60vw)] border-none bg-transparent text-sm font-medium outline-none"
          />
          <Button type="submit" variant="default" size="sm">
            搜尋
          </Button>
        </form>
      </div>
    </header>
  )
}

export default Header
