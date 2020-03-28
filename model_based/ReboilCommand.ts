import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class ReboilCommand */
export class ReboilCommand implements Goma1015Command {
  /** to manage state */
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
    expect(p.state()).toBe(m.state)
    // not overflowed and OFF_OPEN or ON_OPEN
    if (m.state === State.ON_ACTIVE_KEEP) {
      p.reboil()
      expect(p.state()).toBe(State.ON_ACTIVE_BOIL)
    } else {
      // overflowed or not allowed states
      expect(() => p.reboil()).toThrowError()
    }
    expect(p.water()).toBe(m.water)
    m.state = p.state()
    m.water = p.water()
    this.after = m.state
  }
  toString() {
    return `${this.before} -> reboil() -> ${this.after}`
  }
}
