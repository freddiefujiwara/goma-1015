import { advanceBy, clear } from 'jest-date-mock'

import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class PlugInCommand */
export class PlugInCommand implements Goma1015Command {
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
    p.plugIn()
    //OFF_OPEN/OFF_CLOSE -> plugIn()
    if (m.state === State.OFF_OPEN) {
      //the state should be ON_OPEN
      expect(p.state()).toBe(State.ON_OPEN)
    } else if (m.state === State.OFF_CLOSE) {
      //the state should be moved to State.ON_ACTIVE_BOIL if the water volume is greater than 10
      expect(p.state()).toBe(p.water() >= 10 ? State.ON_ACTIVE_BOIL : State.ON_IDLE)
    }
    //the water volume never changed
    expect(p.water()).toBe(m.water)
    //state under State.ON_ACTIVE_BOIL
    if (p.state() === State.ON_ACTIVE_BOIL) {
      //passed 1 sec
      advanceBy(1000)
      //the temperature should be warmed a bit
      expect(p.temperature() > m.temperature).toBe(true)
      //clear Date.now()
      clear()
    } else {
      //otherwise the temperature must not be changed
      expect(p.temperature()).toBe(m.temperature)
    }
    m.state = p.state()
  }
  toString() {
    return `${this.state} -> plugIn()`
  }
}
