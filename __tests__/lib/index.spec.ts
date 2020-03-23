import fc from 'fast-check'
import { advanceBy, clear } from 'jest-date-mock'

import { Goma1015, State } from '../../src/lib/index'
//import { Goma1015Model }    from '../../model_based/Goma1015Model';
//import { Goma1015Commands } from '../../model_based/Goma1015Commands';

describe('Goma1015', () => {
  it('can create new instance', () => {
    const g = new Goma1015()
    expect(g).not.toBeNull()
    expect(g).toBeInstanceOf(Goma1015)
  })
  it('can open or close', () => {
    const g = new Goma1015()
    //check definition
    expect(g.open).toBeDefined()
    expect(g.close).toBeDefined()
    expect(g.state).toBeDefined()

    //default is close
    expect(g.state() === State.OFF_CLOSE).toBe(true)

    //property based testing for open/close
    fc.assert(
      fc.property(fc.boolean(), b => {
        if (b) {
          g.open()
          expect(g.state() === State.OFF_OPEN).toBe(true)
          return
        }
        g.close()
        expect(g.state() === State.OFF_CLOSE).toBe(true)
      }),
    )
  })
  it('can fill', () => {
    let g = new Goma1015()
    //check definition
    expect(g.fill).toBeDefined()
    expect(g.water).toBeDefined()

    //filling needs to be pot opened
    expect(() => g.fill(15)).toThrowError(/should be OPEN/)
    expect(g.water()).toBe(0)

    //negative water
    g.open()
    expect(() => g.fill(-1)).toThrowError(/can't be filled with negative number/)
    expect(g.water()).toBe(0)

    //if full can not be filled water anymore
    //fill water 1,000 ml
    g.fill(1000)
    expect(g.water()).toBe(1000)
    expect(() => g.fill(1)).toThrowError(/is full/)

    //property based testing for fill
    g = new Goma1015()
    g.open()
    g.plugIn()
    g.plugOff()
    let water = 0
    fc.assert(
      fc.property(fc.nat(1000), w => {
        // to be full
        if (water + w > 1000) {
          expect(() => g.fill(w)).toThrowError(/is full/)
          return
        }
        g.fill(w)
        water += w
        // confirm water volume
        expect(g.water()).toBe(water)
      }),
    )
  })
  it('can dispense', () => {
    let g = new Goma1015()
    //check definition
    expect(g.dispense).toBeDefined()
    expect(g.plugIn).toBeDefined()
    expect(g.plugOff).toBeDefined()

    //deault plugOff
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    //dispenseing needs to be pot closed
    g.open()
    g.plugIn()
    g.plugIn()
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.close()

    //dispenseing needs to be pot plugged
    g.plugOff()
    g.plugOff()
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.plugIn()

    //negative sec
    expect(() => g.dispense(-1)).toThrowError(/can't be dispensed with negative sec/)
    //can not dispense water anymore if empty
    expect(g.dispense(100)).toBe(0)

    //property based testing for dispense
    g = new Goma1015()
    //fill to full
    let water = 1000
    g.plugIn()
    g.open()
    g.fill(water)
    g.close()
    fc.assert(
      fc.property(fc.nat(10), fc.nat(1000), (s, w) => {
        water = g.water()
        // if it doens't have enough water to be IDLE
        if (water < 10) {
          expect(g.state()).toBe(State.ON_IDLE)
          //water is dispenseed 10 ml/sec
          //means - 10ml
          expect(g.dispense(1)).toBe(water)
          //refill
          g.open()
          g.fill(w)
          g.close()
          return
        }
        //it is active
        if (g.state() === State.ON_ACTIVE_BOIL) {
          //after 1 sec the temp should be 25 > and < 100
          advanceBy(1000)
          expect(g.temperature() > 25).toBe(true)
          expect(g.temperature() < 100).toBe(true)
          //temp should be 100 after 60000 sec passed
          advanceBy(59000)
          expect(g.temperature() == 100).toBe(true)
          //temp should be 100 after 60001 sec passed
          advanceBy(1)
          expect(g.temperature() == 100).toBe(true)
        }
        //it should be KEEP
        expect(g.state()).toBe(State.ON_ACTIVE_KEEP)
        if (s > 0) {
          expect(g.dispense(s)).not.toBe(0)
        }
      }),
    )
    //clear Date.now()
    clear()
  })
  it('can get temperature', () => {
    const g = new Goma1015()
    expect(g.temperature).toBeDefined()
    expect(g.temperature()).toBe(25)
  })
  it('can get water', () => {
    const g = new Goma1015()
    expect(g.water).toBeDefined()
    expect(g.water()).toBe(0)
  })
  it('can reboil,fill,dispense,open and close for some specific states', () => {
    const g = new Goma1015()
    expect(g.reboil).toBeDefined()
    //OFF_CLOSE
    expect(g.state()).toBe(State.OFF_CLOSE)
    expect(g.water()).toBe(0)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.fill(10)).toThrowError(/should be OPEN/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.close()
    expect(g.state()).toBe(State.OFF_CLOSE)

    g.open()
    //OFF_OPEN
    expect(g.state()).toBe(State.OFF_OPEN)
    expect(g.water()).toBe(0)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.open()
    expect(g.state()).toBe(State.OFF_OPEN)

    g.plugIn()
    //ON_OPEN
    expect(g.state()).toBe(State.ON_OPEN)
    expect(g.water()).toBe(0)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.open()
    expect(g.state()).toBe(State.ON_OPEN)

    g.fill(9)
    g.close()
    //ON_IDLE
    expect(g.state()).toBe(State.ON_IDLE)
    expect(g.water()).toBe(9)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.fill(10)).toThrowError(/should be OPEN/)
    g.close()
    expect(g.state()).toBe(State.ON_IDLE)

    g.plugOff()
    //OFF_CLOSE
    expect(g.state()).toBe(State.OFF_CLOSE)
    expect(g.water()).toBe(9)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.fill(10)).toThrowError(/should be OPEN/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)

    g.open()
    //OFF_OPEN
    expect(g.state()).toBe(State.OFF_OPEN)
    expect(g.water()).toBe(9)
    expect(g.temperature()).toBe(25)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)

    g.fill(1)
    g.close()
    g.plugIn()
    //ON_ACTIVE_BOIL
    expect(g.state()).toBe(State.ON_ACTIVE_BOIL)
    expect(g.water()).toBe(10)
    expect(g.temperature() >= 25).toBe(true)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)
    expect(() => g.fill(10)).toThrowError(/should be OPEN/)
    expect(() => g.dispense(15)).toThrowError(/should be IDLE or KEEP/)
    g.close()
    expect(g.state()).toBe(State.ON_ACTIVE_BOIL)

    advanceBy(58000)
    expect(g.state()).toBe(State.ON_ACTIVE_BOIL)
    expect(g.water()).toBe(10)
    expect(g.temperature() < 100).toBe(true)
    expect(() => g.reboil()).toThrowError(/should be KEEP/)

    //ON_ACTIVE_KEEP
    advanceBy(2000)
    expect(g.state()).toBe(State.ON_ACTIVE_KEEP)
    expect(g.water()).toBe(10)
    expect(g.temperature()).toBe(100)
    expect(() => g.fill(10)).toThrowError(/should be OPEN/)
    g.close()
    expect(g.state()).toBe(State.ON_ACTIVE_KEEP)

    g.reboil()
    //ON_ACTIVE_BOIL
    expect(g.state()).toBe(State.ON_ACTIVE_BOIL)
    expect(g.temperature() < 100).toBe(true)

    //clear Date.now()
    clear()
  })
  /*
  it('should detect potential issues with the Goma1015', () =>
    fc.assert(
      fc.property(Goma1015Commands, commands => {
        const real = new Goma1015()
        const model = new Goma1015Model()
        fc.modelRun(() => ({ model, real }), commands)
      }),
    ))
   */
})
