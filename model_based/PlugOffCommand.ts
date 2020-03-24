import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class PlugOffCommand */
export class PlugOffCommand implements Goma1015Command {
  /** to manage state */
  private state: number
  /**
   * check
   * it runs under any states
   * @param m:Goma1015Model
   */
  check(m: Goma1015Model) {
    this.state = m.state
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
    //the action
    p.plugOff()
    //the state should be moved to OFF_CLOSE if under ON
    if (
      m.state === State.ON_IDLE ||
      m.state === State.ON_ACTIVE_BOIL ||
      m.state === State.ON_ACTIVE_KEEP
    ) {
      expect(p.state()).toBe(State.OFF_CLOSE)
      //the state should be moved to OFF_CLOSE if under ON_OPEN
    } else if (m.state === State.ON_OPEN) {
      expect(p.state()).toBe(State.OFF_OPEN)
    }
    //the water volume must not be changed
    expect(p.water()).toBe(m.water)
    //the temperature should be 25
    expect(p.temperature()).toBe(25)
    m.state = p.state()
  }
  toString() {
    return `${this.state} -> plugOff()`
  }
}
