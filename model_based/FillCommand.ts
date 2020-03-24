import { Goma1015, State } from '../src/lib/index'
import { Goma1015Command, Goma1015Model } from './Goma1015Model'

/** Class FillCommand */
export class FillCommand implements Goma1015Command {
  /** to manage fill water volume */
  private fill: number
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
    const beforeWater = p.water()
    //vouldary value 9,10 and 11
    this.fill = 10 //Math.floor(Math.random() * 3) + 9
    // not overflowed and OFF_OPEN or ON_OPEN
    if (m.state === State.OFF_OPEN && this.fill + beforeWater <= 1000) {
      //can fill
      p.fill(this.fill)
      expect(p.water()).toBe(beforeWater + this.fill)
    } else if (m.state === State.ON_OPEN && this.fill + beforeWater <= 1000) {
      //can fill
      p.fill(this.fill)
      expect(p.water()).toBe(beforeWater + this.fill)
    } else {
      // overflowed or not allowed states
      expect(() => fill(this.fill)).toThrowError()
    }
    m.state = p.state()
    m.water = p.water()
  }
  toString() {
    return `${this.state} -> fill(${this.fill})`
  }
}
