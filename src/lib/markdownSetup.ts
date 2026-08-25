import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkMath from 'remark-math'
import remarkEmoji from 'remark-emoji'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const CALLOUT_TONES: Record<string, string> = {
  info: 'info',
  note: 'note',
  tip: 'tip',
  tips: 'tip',
  hint: 'tip',
  success: 'success',
  check: 'success',
  warning: 'warning',
  warn: 'warning',
  attention: 'warning',
  caution: 'caution',
  danger: 'danger',
  error: 'danger',
  question: 'question',
  help: 'question',
  quote: 'quote',
  cite: 'quote',
  important: 'important',
}

interface DirectiveLike {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  data?: Record<string, unknown>
  children?: DirectiveChild[]
}

interface DirectiveChild {
  type: string
  data?: Record<string, unknown>
  children?: DirectiveChild[]
  [key: string]: unknown
}

/** 將 HackMD 風格 :::name ... ::: 容器轉為樣式化提示框 */
function remarkHackMDContainers() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const n = node as unknown as DirectiveLike
      if (n.type !== 'containerDirective') return

      const tone = CALLOUT_TONES[String(n.name ?? '')] ?? 'info'
      const data: Record<string, unknown> = n.data ?? (n.data = {})
      const title = String(n.attributes?.title ?? '').trim()
      const children = n.children ?? []

      if (n.name === 'spoiler' || n.name === 'details') {
        data.hName = 'details'
        data.hProperties = { className: ['callout', 'callout-spoiler'] }
        if (title !== '') {
          n.children = [
            {
              type: 'paragraph',
              data: { hName: 'summary' },
              children: [{ type: 'text', value: title }],
            },
            ...children,
          ]
        } else {
          const first: DirectiveChild | undefined = children[0]
          if (first !== undefined && first.type === 'paragraph') {
            first.data = { ...first.data, hName: 'summary' }
          }
        }
        return
      }

      data.hName = 'div'
      data.hProperties = { className: ['callout', `callout-${tone}`] }
      if (title !== '') {
        n.children = [
          {
            type: 'paragraph',
            data: { hProperties: { className: ['callout-title'] } },
            children: [{ type: 'strong', children: [{ type: 'text', value: title }] }],
          },
          ...children,
        ]
      }
    })
  }
}

export function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkEmoji, { emoticon: true })
    .use(remarkMath)
    .use(remarkDirective)
    .use(remarkHackMDContainers)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: false, plainText: ['mermaid', 'text', 'txt'] })
    .use(rehypeStringify, { allowDangerousHtml: true })
}
