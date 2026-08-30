import { useState } from 'react'
import { Button } from 'tpass-ui'
import { recentDocs, stats, topLevelFolders } from '../lib/docs'
import { hrefCat, hrefDoc } from '../lib/router'
import { TONE_CLASSES, toneByName } from '../lib/tone'
import { ArrowUpRightIcon, BookOpenIcon, FileIcon, FolderIcon, SearchIcon, UsersIcon } from './Icons'

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
    <form
      className="mt-1 flex w-full max-w-[34rem] items-center gap-2 rounded-2xl border-2 border-foreground bg-card p-1.5 pl-4 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 focus-within:-translate-y-0.5 focus-within:shadow-[7px_7px_0_0_var(--color-foreground)]"
      onSubmit={submit}
      role="search"
    >
      <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="輸入關鍵字，例如「社團」「獎勵」「申訴」"
        aria-label="搜尋法規"
        className="min-w-0 flex-1 border-none bg-transparent text-base font-medium outline-none"
      />
      <Button type="submit" variant="primary">
        搜尋
      </Button>
    </form>
  )
}

function Home() {
  const folders = topLevelFolders()
  const order = folders.map((folder) => folder.name)

  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(color-mix(in oklch, var(--color-foreground) 16%, transparent) 1.4px, transparent 1.4px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(75% 65% at 50% 0%, black, transparent)',
          }}
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="m-0 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            臺北市數位實驗高級中等學校 · 第五屆學生會
          </p>
          <h1 className="m-0 text-[clamp(2.4rem,6vw,3.75rem)]">
            法規<span className="text-primary">-</span>系統
          </h1>
          <p className="m-0 max-w-[38rem] text-muted-foreground">
            學生會所有章程、校規與行政要點的線上查閱入口，內容由學生會依最新決議即時更新。
          </p>
          <HeroSearch />
          <p className="mt-1.5 text-sm text-muted-foreground">
            {stats.topCategories} 大分類 · {stats.docs} 份法規
            {stats.latestRevision !== '' && (
              <>
                {' '}
                · 最新修訂 <span className="font-mono">{stats.latestRevision}</span>
              </>
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-b-2 border-dashed border-foreground/30 px-4 py-8 sm:px-6">
        <div className="mb-5">
          <h2 className="m-0 text-2xl">分類總覽</h2>
          <p className="m-0.5 mt-1.5 text-sm text-muted-foreground">依法規性質分類，點擊卡片瀏覽該分類下所有法規。</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-6">
          {folders.map((folder, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length]
            const tone = toneByName(folder.name, order)
            const subFolders = folder.children.filter(
              (child) => child.type === 'folder',
            ) as Extract<(typeof folder.children)[number], { type: 'folder' }>[]
            return (
              <a
                key={folder.name}
                className={`group flex flex-col items-start gap-2.5 rounded-2xl border-2 border-foreground p-6 text-left shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)] ${TONE_CLASSES[tone].bg}`}
                href={hrefCat(folder.path)}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-transform duration-200 group-hover:-rotate-6 ${TONE_CLASSES[tone].badge} ${TONE_CLASSES[tone].text}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRightIcon
                    className={`h-5 w-5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${TONE_CLASSES[tone].text}`}
                  />
                </div>
                <h3 className={`m-0 text-lg ${TONE_CLASSES[tone].text}`}>{folder.name}</h3>
                <p className="m-0 text-sm text-muted-foreground">{folder.count} 份法規</p>
                {subFolders.length > 0 && (
                  <p className="m-0 text-xs text-muted-foreground">
                    {subFolders
                      .slice(0, 4)
                      .map((sub) => sub.name)
                      .join('、')}
                  </p>
                )}
              </a>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5">
          <h2 className="m-0 text-2xl">最新修訂</h2>
          <p className="m-0.5 mt-1.5 text-sm text-muted-foreground">最近更新的法規文件，revision 以檔案 metadata 為準。</p>
        </div>
        <ul className="m-0 grid list-none gap-3 p-0">
          {recentDocs(6).map((doc) => (
            <li key={doc.id}>
              <a
                className="flex items-center gap-3.5 rounded-xl border-2 border-foreground bg-card p-3.5 shadow-[3px_3px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-foreground)]"
                href={hrefDoc(doc.id)}
              >
                <FileIcon className="h-5 w-5 shrink-0 text-accent" />
                <span className="font-bold break-words">{doc.title}</span>
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm text-muted-foreground">
                  {doc.categories.join(' › ') || '根目錄'}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
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
