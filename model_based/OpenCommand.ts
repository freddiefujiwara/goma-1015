import * as assert from 'assert'

import { Goma1015 } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

export class OpenCommand implements Goma1015Command {
  constructor(readonly position: number, readonly trackName: string) {}
  check(m: Goma1015Model) {
    return !m.tracksAlreadySeen[this.trackName]
  }
  run(m: Goma1015Model, p: Goma1015) {
    const trackBefore = p.currentTrackName()
    p.addTrack(this.trackName, this.position % (m.numTracks + 1)) // old model
    assert.equal(p.playing(), m.isPlaying)
    assert.equal(p.currentTrackName(), trackBefore)
    ++m.numTracks
    m.tracksAlreadySeen[this.trackName] = true
  }
  toString() {
    return `Open(${this.position}, "${this.trackName}")`
  }
}
