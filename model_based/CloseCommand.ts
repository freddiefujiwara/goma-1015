import { advanceBy } from 'jest-date-mock'

import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class CloseCommand */
export class CloseCommand implements Goma1015Command {
  /** to manage state transition */
  private before: number
  private after: number
  /**
   * check
   * it runs under any states
   * @param m:Goma1015Model
   */
  check(m: Goma1015Model) {
    this.before = m.state
    this.after = m.state
    return true
  }
  /**
   * run
   * @param m:Goma1015Model
   * @param p:Goma1015
   */
  run(m: Goma1015Model, p: Goma1015) {
    //confirm p.state() == m.state
    const stateBefore = p.state()
    expect(stateBefore).toBe(m.state)
    m.temperature = p.temperature()
    // the action
    p.close()
    if (m.state === State.OFF_OPEN) {
      expect(p.state()).toBe(State.OFF_CLOSE)
    } else if (m.state === State.ON_OPEN) {
      expect(p.state()).toBe(p.water() >= 10 ? State.ON_ACTIVE_BOIL : State.ON_IDLE)
    }
    expect(p.water()).toBe(m.water)
    if (p.state() === State.ON_ACTIVE_BOIL) {
      advanceBy(1000)
      expect(p.temperature() > m.temperature).toBe(true)
    } else {
      expect(p.temperature()).toBe(m.temperature)
    }
    m.state = p.state()
    this.after = m.state
  }
  toString() {
    return `${this.before} -> close() -> ${this.after}`
  }
}
