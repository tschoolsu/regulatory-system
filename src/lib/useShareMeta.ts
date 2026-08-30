import { useEffect } from 'react'
import type { Route } from './router'
import { metaFor } from './share'

type MetaAttr = 'name' | 'property'

function upsertMeta(attr: MetaAttr, key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * 依目前路由更新 document.title 與所有分享 meta（og:*、twitter:*、canonical）。
 * 支援執行 JS 的社群爬蟲（Discord / LINE / Slack / Facebook 等）。
 */
export function useShareMeta(route: Route): void {
  useEffect(() => {
    const meta = metaFor(route)
    document.title = meta.title
    upsertMeta('name', 'description', meta.description)
    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', meta.url)
    upsertMeta('property', 'og:image', meta.image)
    upsertMeta('property', 'og:type', meta.type)
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', meta.image)
    setCanonical(meta.url)
  }, [route])
}
