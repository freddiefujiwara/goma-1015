import * as assert from 'assert'

import { Goma1015 } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

export class PlugInCommand implements Goma1015Command {
  check(m: Goma1015Model) {
    return m.isPlaying === true
  }
  run(m: Goma1015Model, p: Goma1015) {
    p.play()
    m.isPlugIning = true
    assert.ok(p.playing())
  }
  toString() {
    return 'PlugIn'
  }
}
