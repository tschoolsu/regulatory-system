const rawModules = import.meta.glob('/regulations/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface DocMeta {
  title: string
  revision: string
  tags: string[]
  author?: string
  extra: Record<string, string>
}

export interface Doc extends DocMeta {
  /** 完整 id，例如「校規/個人行為/1」 */
  id: string
  /** 分類路徑，例如 ['校規', '個人行為'] */
  categories: string[]
  fileName: string
  body: string
}

export interface FolderNode {
  type: 'folder'
  name: string
  path: string[]
  children: TreeNode[]
  count: number
}

export interface DocNode {
  type: 'doc'
  name: string
  doc: Doc
}

export type TreeNode = FolderNode | DocNode

function parseFrontmatter(source: string): { meta: RawMeta; body: string } {
  const normalized = source.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized)
  if (!match) return { meta: {}, body: normalized }

  const meta: RawMeta = {}
  let currentListKey: string | null = null

  for (const line of match[1].split('\n')) {
    const listItem = /^\s*-\s+(.*)$/.exec(line)
    if (listItem && currentListKey) {
      const list = meta[currentListKey]
      if (Array.isArray(list)) list.push(cleanScalar(listItem[1]))
      continue
    }
    const pair = /^([A-Za-z0-9_\-\u4e00-\u9fff]+)\s*:\s*(.*)$/.exec(line)
    if (!pair) continue
    const key = pair[1]
    const value = pair[2].trim()
    currentListKey = null
    if (value === '') {
      meta[key] = []
      currentListKey = key
    } else if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => cleanScalar(item))
        .filter((item) => item !== '')
    } else {
      meta[key] = cleanScalar(value)
    }
  }
  return { meta, body: normalized.slice(match[0].length).trimStart() }
}

type RawMeta = Record<string, unknown>

function cleanScalar(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function buildDoc(path: string, source: string): Doc {
  const { meta, body } = parseFrontmatter(source)
  const relative = safeDecode(path.replace(/^\/regulations\//, '').replace(/\.md$/, ''))
  const parts = relative.split('/')
  const fileName = parts[parts.length - 1]
  const categories = parts.slice(0, -1)
  return {
    id: relative,
    categories,
    fileName,
    title: typeof meta.title === 'string' && meta.title !== '' ? meta.title : fileName,
    revision: typeof meta.revision === 'string' ? meta.revision : '',
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
    author: typeof meta.author === 'string' ? meta.author : undefined,
    extra: Object.fromEntries(
      Object.entries(meta)
        .filter(([key]) => !['title', 'revision', 'tags', 'author'].includes(key))
        .map(([key, value]) => [key, String(value)]),
    ),
    body,
  }
}

export const allDocs: Doc[] = Object.entries(rawModules)
  .map(([path, source]) => buildDoc(path, source))
  .sort((a, b) => a.id.localeCompare(b.id, 'zh-Hant-TW'))

const docMap = new Map(allDocs.map((doc) => [doc.id, doc]))

export function getDoc(id: string): Doc | undefined {
  return docMap.get(safeDecode(id))
}

function insertFolder(children: TreeNode[], name: string): FolderNode {
  let node = children.find(
    (child): child is FolderNode => child.type === 'folder' && child.name === name,
  )
  if (!node) {
    node = { type: 'folder', name, path: [], children: [], count: 0 }
    children.push(node)
  }
  return node
}

export function buildTree(docs: Doc[]): TreeNode[] {
  const root: TreeNode[] = []
  for (const doc of docs) {
    let level = root
    let pathAccumulator: string[] = []
    for (const segment of doc.categories) {
      pathAccumulator = [...pathAccumulator, segment]
      const folder = insertFolder(level, segment)
      folder.path = [...pathAccumulator]
      level = folder.children
    }
    level.push({ type: 'doc', name: doc.fileName, doc })
  }
  sortTree(root)
  recount(root)
  return root
}

function sortTree(nodes: TreeNode[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant-TW'))
  for (const node of nodes) {
    if (node.type === 'folder') sortTree(node.children)
  }
}

function recount(nodes: TreeNode[]): number {
  let total = 0
  for (const node of nodes) {
    if (node.type === 'doc') total += 1
    else {
      node.count = recount(node.children)
      total += node.count
    }
  }
  return total
}

export const tree: TreeNode[] = buildTree(allDocs)

/** 頂層分類（首頁大卡片用） */
export function topLevelFolders(): FolderNode[] {
  return tree.filter((node): node is FolderNode => node.type === 'folder')
}

export function folderByPath(segments: string[]): FolderNode | undefined {
  let level: TreeNode[] = tree
  let found: FolderNode | undefined
  for (const segment of segments) {
    const node = level.find(
      (candidate): candidate is FolderNode =>
        candidate.type === 'folder' && candidate.name === segment,
    )
    if (!node) return undefined
    found = node
    level = node.children
  }
  return found
}

export function docsUnder(node: FolderNode): Doc[] {
  const result: Doc[] = []
  const walk = (nodes: TreeNode[]) => {
    for (const item of nodes) {
      if (item.type === 'doc') result.push(item.doc)
      else walk(item.children)
    }
  }
  walk(node.children)
  return result
}

export interface SearchHit {
  doc: Doc
  snippet: string
}

export function searchDocs(query: string, limit = 30): SearchHit[] {
  const keyword = query.trim().toLowerCase()
  if (keyword === '') return []
  const hits: SearchHit[] = []
  for (const doc of allDocs) {
    const haystackTitle = `${doc.title} ${doc.fileName}`.toLowerCase()
    const haystackTags = doc.tags.join(' ').toLowerCase()
    const contentIndex = doc.body.toLowerCase().indexOf(keyword)
    if (haystackTitle.includes(keyword) || haystackTags.includes(keyword)) {
      hits.push({ doc, snippet: excerpt(doc.body, keyword, contentIndex) })
    } else if (contentIndex >= 0) {
      hits.push({ doc, snippet: excerpt(doc.body, keyword, contentIndex) })
    }
    if (hits.length >= limit * 3) break
  }
  return rank(hits, keyword).slice(0, limit)
}

function rank(hits: SearchHit[], keyword: string): SearchHit[] {
  return hits.sort((a, b) => score(b, keyword) - score(a, keyword))
}

function score(hit: SearchHit, keyword: string): number {
  let value = 0
  if (`${hit.doc.title} ${hit.doc.fileName}`.toLowerCase().includes(keyword)) value += 100
  if (hit.doc.tags.join(' ').toLowerCase().includes(keyword)) value += 50
  return value
}

function excerpt(body: string, keyword: string, index: number): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[#>*_`[\]()!|-]/g, ' ')
  const at = index >= 0 ? plain.toLowerCase().indexOf(keyword) : -1
  if (at < 0) return plain.slice(0, 90).trim() + (plain.length > 90 ? '…' : '')
  const start = Math.max(0, at - 35)
  return (
    (start > 0 ? '…' : '') + plain.slice(start, start + 110).trim() + (start + 110 < plain.length ? '…' : '')
  )
}

/** 依 revision 排序的最新修訂文件 */
export function recentDocs(count = 6): Doc[] {
  return [...allDocs]
    .filter((doc) => doc.revision !== '')
    .sort((a, b) => b.revision.localeCompare(a.revision))
    .slice(0, count)
}

/** 展平後的文件順序，供上一篇 / 下一篇導覽 */
export function flatDocIds(): string[] {
  return allDocs.map((doc) => doc.id)
}

export const stats = {
  docs: allDocs.length,
  topCategories: topLevelFolders().length,
  latestRevision: recentDocs(1)[0]?.revision ?? '',
}
