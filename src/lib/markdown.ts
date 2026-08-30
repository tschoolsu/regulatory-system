type ProcessorModule = typeof import('./markdownSetup')

const GFM_ALERT_TONES: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
}

/** [TOC] 語法：渲染後由前端以實際標題填入 */
function replaceToc(body: string): string {
  return body.replace(
    /^[ \t]*\[TOC\][ \t]*$/gm,
    '<div id="md-toc" class="md-toc"></div>\n',
  )
}

/** GitHub 風格 > [!NOTE] 轉為樣式化提示框 */
function convertGfmAlerts(html: string): string {
  return html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?([\s\S]*?)<\/blockquote>/g,
    (_match: string, kind: string, _br: string, inner: string) =>
      `<div class="callout callout-${GFM_ALERT_TONES[kind] ?? 'note'}">${inner}</div>`,
  )
}

/** HackMD 的 :::name Title 寫法，轉成 remark-directive 支援的 :::name{title="..."} */
function normalizeHackmdDirectives(body: string): string {
  return body.replace(
    /^(\s*):::(?![:\s])([A-Za-z0-9_-]+)\s+(.+?)\s*$/gm,
    (_match: string, indent: string, name: string, title: string) =>
      `${indent}:::${name}{title=${JSON.stringify(title)}}`,
  )
}

let processorModule: Promise<ProcessorModule> | undefined

async function getProcessor() {
  processorModule ??= import('./markdownSetup')
  const module = await processorModule
  return module.createProcessor()
}

export async function renderMarkdown(body: string): Promise<string> {
  const processor = await getProcessor()
  const file = await processor.process(replaceToc(normalizeHackmdDirectives(body)))
  return convertGfmAlerts(String(file))
}
