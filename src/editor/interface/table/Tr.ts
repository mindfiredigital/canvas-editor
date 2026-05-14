import { ITd } from './Td'

export interface ITr {
  id?: string
  height: number
  tdList: ITd[]
  minHeight?: number
  // Stable logical-row identifier shared across every fragment of the
  // same row when pagination splits it over multiple pages. Set once
  // at first split (equal to the row's pre-split id); each fragment
  // (current-page splitTr and next-page continuation) carries it
  // unchanged through further splits and merges, so merge can pair
  // fragments by originalRowId regardless of how many page boundaries
  // the row crosses.
  originalRowId?: string
}
