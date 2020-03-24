import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class DispenseCommand */
export class DispenseCommand implements Goma1015Command {
  /** to manage dispense water volume */
  private dispense: number
  /** to manage state transition */
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
    const beforeWater = p.water()

    //vouldary value 9,10 and 11
    this.dispense = 10 //Math.floor(Math.random() * 3) + 9
    // it can dispense under State.ON_IDLE
    if (m.state === State.ON_IDLE) {
      p.dispense(this.dispense)
      expect(p.water() <= beforeWater).toBe(true)
      // it can dispense under State.ON_ACTIVE_KEEP
    } else if (m.state === State.ON_ACTIVE_KEEP) {
      p.dispense(this.dispense)
      expect(p.water() <= beforeWater).toBe(true)
      // it should be moved to ON_IDLE if water under 10
      if (p.water() < 10) {
        expect(p.state()).toBe(State.ON_IDLE)
      }
    } else {
      // dispense only allowed under State.ON_IDLE or State.ON_ACTIVE_KEEP
      expect(() => dispense(this.dispense)).toThrowError()
    }
    m.state = p.state()
    m.water = p.water()
  }
  toString() {
    return `${this.state} -> dispense(${this.dispense})`
  }
}
