import { useState } from 'react'
import { recentDocs, stats, topLevelFolders } from '../lib/docs'
import { hrefCat, hrefDoc } from '../lib/router'
import { toneByName } from '../lib/tone'
import { ArrowUpRightIcon, BookOpenIcon, CalendarIcon, FileIcon, FolderIcon, SearchIcon, UsersIcon } from './Icons'

const CARD_ICONS = [UsersIcon, FolderIcon, BookOpenIcon]

function HeroSearch() {
  const [query, setQuery] = useState('')
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const keyword = query.trim()
    if (keyword === '') return
    window.location.hash = `#/search?q=${encodeURIComponent(keyword)}`
  }
  return (
    <form className="hero-search" onSubmit={submit} role="search">
      <SearchIcon className="h-5 w-5" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="輸入關鍵字，例如「社團」「獎勵」「申訴」"
        aria-label="搜尋法規"
      />
      <button type="submit" className="btn btn-primary">
        搜尋
      </button>
    </form>
  )
}

function Home() {
  const folders = topLevelFolders()
  const order = folders.map((folder) => folder.name)

  return (
    <>
      <section className="hero">
        <div className="hero-dots" aria-hidden />
        <div className="container hero-inner">
          <span className="tag tag-accent">臺北市數位實驗高級中等學校 · 第五屆學生會</span>
          <h1 className="hero-title">
            法規<span className="hyphen">-</span>系統
          </h1>
          <p className="hero-sub">
            學生會所有章程、校規與行政要點的線上查閱入口，內容由學生會依最新決議即時更新。
          </p>
          <HeroSearch />
          <div className="hero-stats">
            <span className="tag">{stats.topCategories} 大分類</span>
            <span className="tag">{stats.docs} 份法規</span>
            <span className="tag tag-green">
              <CalendarIcon className="h-3.5 w-3.5" /> 最新修訂 {stats.latestRevision || '—'}
            </span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>分類總覽</h2>
          <p>依法規性質分類，點擊卡片瀏覽該分類下所有法規。</p>
        </div>
        <div className="card-grid">
          {folders.map((folder, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length]
            const subFolders = folder.children.filter(
              (child) => child.type === 'folder',
            ) as Extract<(typeof folder.children)[number], { type: 'folder' }>[]
            return (
              <a
                key={folder.name}
                className={`service-card tone-${toneByName(folder.name, order)}`}
                href={hrefCat(folder.path)}
              >
                <div className="service-card-top">
                  <span className="icon-badge tone-badge">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRightIcon className="arrow h-5 w-5" />
                </div>
                <h3>{folder.name}</h3>
                <p className="muted">{folder.count} 份法規</p>
                <div className="chip-row">
                  {subFolders.slice(0, 4).map((sub) => (
                    <span key={sub.name} className="chip">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </a>
            )
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>最新修訂</h2>
          <p>最近更新的法規文件，revision 以檔案 metadata 為準。</p>
        </div>
        <ul className="recent-list">
          {recentDocs(6).map((doc) => (
            <li key={doc.id}>
              <a className="recent-row" href={hrefDoc(doc.id)}>
                <FileIcon className="recent-icon h-5 w-5" />
                <span className="recent-title">{doc.title}</span>
                <span className="recent-path muted">{doc.categories.join(' › ') || '根目錄'}</span>
                <span className={`tag tone-tag tone-${toneByName(doc.categories[0] ?? '', order)}`}>
                  {doc.revision !== '' ? `rev ${doc.revision}` : '未標記修訂'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Home
