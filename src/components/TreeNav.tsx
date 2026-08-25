import type { DocNode, FolderNode, TreeNode } from '../lib/docs'
import { hrefCat, hrefDoc } from '../lib/router'
import { FileIcon, FolderIcon } from './Icons'

interface TreeNavProps {
  nodes: TreeNode[]
  activeId?: string
  depth?: number
}

export default function TreeNav({ nodes, activeId, depth = 0 }: TreeNavProps) {
  return (
    <ul className={depth === 0 ? 'tree-nav tree-root' : 'tree-nav'}>
      {nodes.map((node) => (
        <li key={node.type === 'folder' ? node.path.join('/') : node.doc.id}>
          {node.type === 'folder' ? (
            <FolderBranch folder={node} activeId={activeId} depth={depth} />
          ) : (
            <LeafDoc leaf={node} activeId={activeId} />
          )}
        </li>
      ))}
    </ul>
  )
}

function FolderBranch({
  folder,
  activeId,
  depth,
}: {
  folder: FolderNode
  activeId?: string
  depth: number
}) {
  const prefix = `${folder.path.join('/')}/`
  const containsActive = activeId !== undefined && (activeId.startsWith(prefix) || activeId === folder.path.join('/'))
  return (
    <details open={containsActive || depth === 0}>
      <summary className="tree-folder">
        <FolderIcon className="h-4 w-4" />
        <a
          href={hrefCat(folder.path)}
          onClick={(event) => event.stopPropagation()}
        >
          {folder.name}
        </a>
        <span className="tree-count">{folder.count}</span>
      </summary>
      <TreeNav nodes={folder.children} activeId={activeId} depth={depth + 1} />
    </details>
  )
}

function LeafDoc({ leaf, activeId }: { leaf: DocNode; activeId?: string }) {
  const active = leaf.doc.id === activeId
  return (
    <a className={`tree-doc${active ? ' is-active' : ''}`} href={hrefDoc(leaf.doc.id)}>
      <FileIcon className="h-4 w-4" />
      <span>{leaf.doc.title}</span>
    </a>
  )
}
