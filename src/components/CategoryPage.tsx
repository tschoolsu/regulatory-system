import { docsUnder, folderByPath, topLevelFolders } from '../lib/docs'
import type { FolderNode } from '../lib/docs'
import { hrefCat, hrefDoc } from '../lib/router'
import { toneByName } from '../lib/tone'
import Breadcrumbs from './Breadcrumbs'
import { ArrowUpRightIcon, FileIcon, FolderIcon } from './Icons'

function NotFound({ segments }: { segments: string[] }) {
  return (
    <div className="container section">
      <div className="notfound-card">
        <span className="tag tag-rose">404</span>
        <h1>找不到這個分類</h1>
        <p className="muted">路徑「{segments.join(' / ')}」不存在，可能已被移動或重新命名。</p>
        <a className="btn btn-primary" href={hrefCat([]).replace('/cat', '')}>
          回首頁
        </a>
      </div>
    </div>
  )
}

function CategoryPage({ segments }: { segments: string[] }) {
  const folder = folderByPath(segments)
  if (!folder) return <NotFound segments={segments} />

  const order = topLevelFolders().map((item) => item.name)
  const tone = toneByName(segments[0] ?? '', order)
  const subFolders = folder.children.filter(
    (child): child is FolderNode => child.type === 'folder',
  )
  const docs = docsUnder(folder)

  return (
    <div className="container section">
      <Breadcrumbs path={segments} />
      <header className={`cat-header tone-${tone}`}>
        <span className="icon-badge tone-badge">
          <FolderIcon className="h-5 w-5" />
        </span>
        <div>
          <h1>{folder.name}</h1>
          <p className="muted">
            共 {docs.length} 份法規 · {subFolders.length} 個子分類
          </p>
        </div>
      </header>

      {subFolders.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>子分類</h2>
          </div>
          <div className="card-grid card-grid-sm">
            {subFolders.map((sub) => (
              <a key={sub.name} className={`service-card tone-${tone}`} href={hrefCat(sub.path)}>
                <div className="service-card-top">
                  <span className="icon-badge tone-badge">
                    <FolderIcon className="h-5 w-5" />
                  </span>
                  <ArrowUpRightIcon className="arrow h-5 w-5" />
                </div>
                <h3>{sub.name}</h3>
                <p className="muted">{sub.count} 份法規</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>法規列表</h2>
        </div>
        <ul className="recent-list">
          {docs.map((doc) => (
            <li key={doc.id}>
              <a className="recent-row" href={hrefDoc(doc.id)}>
                <FileIcon className="recent-icon h-5 w-5" />
                <span className="recent-title">{doc.title}</span>
                {doc.tags.length > 0 && (
                  <span className="recent-path muted">{doc.tags.join('、')}</span>
                )}
                <span className="tag tone-tag tone-neutral">{doc.revision !== '' ? `rev ${doc.revision}` : '—'}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default CategoryPage
