import { hrefCat } from '../lib/router'

export default function Breadcrumbs({ path, current }: { path: string[]; current?: string }) {
  return (
    <nav className="breadcrumbs" aria-label="所在分類">
      <span className="crumb">
        <a href={hrefCat([]).replace('/cat', '')}>首頁</a>
      </span>
      {path.map((segment, index) => {
        const target = path.slice(0, index + 1)
        const isLast = index === path.length - 1 && current === undefined
        return (
          <span key={target.join('/')} className="crumb">
            <span className="crumb-sep">›</span>
            {isLast ? <span className="crumb-current">{segment}</span> : <a href={hrefCat(target)}>{segment}</a>}
          </span>
        )
      })}
      {current !== undefined && (
        <span className="crumb">
          <span className="crumb-sep">›</span>
          <span className="crumb-current">{current}</span>
        </span>
      )}
    </nav>
  )
}
