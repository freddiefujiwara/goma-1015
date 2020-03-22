import * as assert from 'assert'

import { Goma1015 } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

export class CloseCommand implements Goma1015Command {
  check(m: Goma1015Model) {
    return m.isPlaying === true
  }
  run(m: Goma1015Model, p: Goma1015) {
    const trackBefore = p.currentTrackName()
    p.next()
    assert.equal(p.playing(), m.isPlaying)
    if (m.numTracks === 1) {
      assert.equal(p.currentTrackName(), trackBefore)
    } else {
      assert.notEqual(p.currentTrackName(), trackBefore)
    }
  }
  toString() {
    return 'Close'
  }
}
