import { MaxHeightRatio } from '../enum/Common'

// Conversion factor from typographic points (pt) to CSS pixels (px) at 96dpi.
// User-facing font sizes are stored as pt (matching word processors like Google Docs);
// canvas rendering needs px, so multiply by this when converting size\u2192pixels.
export const PX_PER_PT = 4 / 3

export const ZERO = '\u200B'
export const WRAP = '\n'
export const HORIZON_TAB = '\t'
export const NBSP = '\u0020'
export const PUNCTUATION_LIST = [
  '·',
  '、',
  ':',
  '：',
  ',',
  '，',
  '.',
  '。',
  ';',
  '；',
  '?',
  '？',
  '!',
  '！'
]

export const maxHeightRadioMapping: Record<MaxHeightRatio, number> = {
  [MaxHeightRatio.HALF]: 1 / 2,
  [MaxHeightRatio.ONE_THIRD]: 1 / 3,
  [MaxHeightRatio.QUARTER]: 1 / 4
}
