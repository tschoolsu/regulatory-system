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
