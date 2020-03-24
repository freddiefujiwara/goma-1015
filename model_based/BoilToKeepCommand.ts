import { advanceBy, clear } from 'jest-date-mock'

import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class BoilToKeepCommand */
export class BoilToKeepCommand implements Goma1015Command {
  /** to manage state transition */
  private state: number
  /**
   * check
   * it runs under State.ON_ACTIVE_BOIL
   * @param m:Goma1015Model
   */
  check(m: Goma1015Model) {
    this.state = m.state
    return this.state === State.ON_ACTIVE_BOIL
  }
  /**
   * run
   * @param m:Goma1015Model
   * @param p:Goma1015
   */
  run(m: Goma1015Model, p: Goma1015) {
    // temperature should be >= 25 && < 100 during State.ON_ACTIVE_BOIL
    expect(p.temperature() >= 25).toBe(true)
    expect(p.temperature() < 100).toBe(true)
    // passed enough time 1 min
    advanceBy(60 * 1000)
    // temperature should be 100
    expect(p.temperature()).toBe(100)
    // state should be moved to ON_ACTIVE_KEEP
    expect(p.state()).toBe(State.ON_ACTIVE_KEEP)
    // clear Date.now()
    clear()
    m.state = p.state()
    m.water = p.water()
    m.temperature = p.temperature()
  }
  toString() {
    return `${this.state} -> advanceBy(60*1000)`
  }
}
