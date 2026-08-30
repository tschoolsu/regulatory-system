import { docsUnder, folderByPath, topLevelFolders } from '../lib/docs'
import type { FolderNode } from '../lib/docs'
import { hrefCat, hrefDoc } from '../lib/router'
import { TONE_CLASSES, toneByName } from '../lib/tone'
import Breadcrumbs from './Breadcrumbs'
import { ArrowUpRightIcon, FileIcon, FolderIcon } from './Icons'
import LinkButton from './LinkButton'

function NotFound({ segments }: { segments: string[] }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-[30rem] flex-col items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-9 text-center shadow-[4px_4px_0_0_var(--color-destructive)]">
        <span className="rounded-md border-2 border-foreground bg-tone-rose-bg px-2 py-0.5 font-mono text-[11px] font-bold text-tone-rose-text">
          404
        </span>
        <h1 className="m-0">找不到這個分類</h1>
        <p className="m-0 text-sm text-muted-foreground">路徑「{segments.join(' / ')}」不存在，可能已被移動或重新命名。</p>
        <LinkButton href={hrefCat([]).replace('/cat', '')}>回首頁</LinkButton>
      </div>
    </div>
  )
}

function CategoryPage({ segments }: { segments: string[] }) {
  const folder = folderByPath(segments)
  if (!folder) return <NotFound segments={segments} />

  const order = topLevelFolders().map((item) => item.name)
  const tone = TONE_CLASSES[toneByName(segments[0] ?? '', order)]
  const subFolders = folder.children.filter(
    (child): child is FolderNode => child.type === 'folder',
  )
  const docs = docsUnder(folder)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs path={segments} />
      <header className={`mb-2 flex items-center gap-4 rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_var(--color-foreground)] ${tone.bg}`}>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] ${tone.badge} ${tone.text}`}>
          <FolderIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className={`m-0 text-2xl ${tone.text}`}>{folder.name}</h1>
          <p className="m-0 mt-0.5 text-muted-foreground">
            共 {docs.length} 份法規 · {subFolders.length} 個子分類
          </p>
        </div>
      </header>

      {subFolders.length > 0 && (
        <section className="border-b-2 border-dashed border-foreground/30 py-8">
          <div className="mb-5">
            <h2 className="m-0 text-2xl">子分類</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-5">
            {subFolders.map((sub) => (
              <a
                key={sub.name}
                className={`group flex flex-col items-start gap-2.5 rounded-2xl border-2 border-foreground p-5 text-left shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)] ${tone.bg}`}
                href={hrefCat(sub.path)}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-transform duration-200 group-hover:-rotate-6 ${tone.badge} ${tone.text}`}
                  >
                    <FolderIcon className="h-5 w-5" />
                  </span>
                  <ArrowUpRightIcon
                    className={`h-5 w-5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${tone.text}`}
                  />
                </div>
                <h3 className={`m-0 text-lg ${tone.text}`}>{sub.name}</h3>
                <p className="m-0 text-sm text-muted-foreground">{sub.count} 份法規</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="py-8">
        <div className="mb-5">
          <h2 className="m-0 text-2xl">法規列表</h2>
        </div>
        <ul className="m-0 grid list-none gap-3 p-0">
          {docs.map((doc) => (
            <li key={doc.id}>
              <a
                className="flex items-center gap-3.5 rounded-xl border-2 border-foreground bg-card p-3.5 shadow-[3px_3px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-foreground)]"
                href={hrefDoc(doc.id)}
              >
                <FileIcon className="h-5 w-5 shrink-0 text-accent" />
                <span className="font-bold break-words">{doc.title}</span>
                {doc.tags.length > 0 && (
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm text-muted-foreground">
                    {doc.tags.join('、')}
                  </span>
                )}
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {doc.revision !== '' ? `rev ${doc.revision}` : '—'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default CategoryPage
