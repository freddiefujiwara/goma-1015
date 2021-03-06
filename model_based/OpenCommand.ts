import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class OpenCommand */
export class OpenCommand implements Goma1015Command {
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
    const stateBefore = p.state()
    expect(stateBefore).toBe(m.state)
    // the action
    const stateBefore = p.state()
    p.open()
    //if OFF_CLOSE/OFF_OPEN -> open()
    if (m.state === State.OFF_CLOSE || m.state === State.OFF_OPEN) {
      //the state should be State.OFF_OPEN
      expect(p.state()).toBe(State.OFF_OPEN)
      //other states
    } else {
      //the state should be State.ON_OPEN
      expect(p.state()).toBe(State.ON_OPEN)
    }
    //water volume must not be changed
    expect(p.water()).toBe(m.water)
    //automatically temperature should be 25
    expect(p.temperature()).toBe(25)
    m.state = p.state()
    this.after = m.state
  }
  toString() {
    return `${this.before} -> open() -> ${this.after}`
  }
}
