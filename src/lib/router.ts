import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'cat'; segments: string[] }
  | { name: 'doc'; id: string }
  | { name: 'search'; query: string }

export function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, '')
  const [pathPart, queryPart] = raw.split('?')
  const segments = pathPart
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))

  if (segments.length === 0) return { name: 'home' }
  if (segments[0] === 'cat' && segments.length > 1) {
    return { name: 'cat', segments: segments.slice(1) }
  }
  if (segments[0] === 'doc' && segments.length > 1) {
    return { name: 'doc', id: segments.slice(1).join('/') }
  }
  if (segments[0] === 'search') {
    const query = new URLSearchParams(queryPart ?? '').get('q') ?? ''
    return { name: 'search', query }
  }
  return { name: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash)
  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function useScrollTopOnNavigate(route: Route): void {
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])
}

export function hrefHome(): string {
  return '#/'
}

export function hrefCat(segments: string[]): string {
  return `#/cat/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}

export function hrefDoc(id: string): string {
  return `#/doc/${id.split('/').map((s) => encodeURIComponent(s)).join('/')}`
}

export function hrefSearch(query: string): string {
  return `#/search?q=${encodeURIComponent(query)}`
}
