const TONES = ['green', 'blue', 'orange', 'violet', 'rose'] as const

export type Tone = (typeof TONES)[number]

export function toneByIndex(index: number): Tone {
  return TONES[((index % TONES.length) + TONES.length) % TONES.length]
}

/** 依分類名稱取得穩定的色調（同一頂層分類永遠同色） */
export function toneByName(name: string, order: string[]): Tone {
  const index = order.indexOf(name)
  return toneByIndex(index >= 0 ? index : name.length)
}

/**
 * tone → Tailwind class。bg/badge/text 對應 tpass-ui/theme.css 的
 * --color-tone-<tone>-{bg,badge,text}，跟 tpass-portal 的 ServiceCard.tsx
 * 用同一套 token，不自己重複定義色值。
 */
export const TONE_CLASSES: Record<Tone, { bg: string; badge: string; text: string }> = {
  green: { bg: 'bg-tone-green-bg', badge: 'bg-tone-green-badge', text: 'text-tone-green-text' },
  blue: { bg: 'bg-tone-blue-bg', badge: 'bg-tone-blue-badge', text: 'text-tone-blue-text' },
  orange: { bg: 'bg-tone-orange-bg', badge: 'bg-tone-orange-badge', text: 'text-tone-orange-text' },
  violet: { bg: 'bg-tone-violet-bg', badge: 'bg-tone-violet-badge', text: 'text-tone-violet-text' },
  rose: { bg: 'bg-tone-rose-bg', badge: 'bg-tone-rose-badge', text: 'text-tone-rose-text' },
}
