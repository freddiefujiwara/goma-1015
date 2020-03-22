import fc from 'fast-check'

import { Goma1015 } from '../src/lib/index'

export class Goma1015Model {
  isPlaying = false
  numTracks = 0
  tracksAlreadySeen: { [Key: string]: boolean } = {} // our model forbid to append twice the same track
}

export type Goma1015Command = fc.Command<Goma1015Model, Goma1015>
