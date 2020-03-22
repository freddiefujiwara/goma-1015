import fc from 'fast-check'
import { advanceBy, clear } from 'jest-date-mock'

import { Goma1015, State } from '../../src/lib/index'

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
    expect(g.state() === State.OFF).toBe(true)

    //property based testing for open/close
    fc.assert(
      fc.property(fc.boolean(), b => {
        if (b) {
          g.open()
          expect(g.state() === State.OFF_OPEN).toBe(true)
          return
        }
        g.close()
        expect(g.state() === State.OFF).toBe(true)
      }),
    )
  })
  it('can fill', () => {
    let g = new Goma1015()
    //check definition
    expect(g.fill).toBeDefined()
    expect(g.water).toBeDefined()

    //filling needs to be pot opened
    expect(() => g.fill(15)).toThrowError(/is not open/)
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
        if (water + w > 1000) {
          expect(() => g.fill(w)).toThrowError(/is full/)
          return
        }
        g.fill(w)
        water += w
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

    //plugOff
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
        //refill if Sate.ON_IDLE
        //* water is dispenseed 10 ml/sec
        water = g.water()
        if (water < 10) {
          expect(g.state()).toBe(State.ON_IDLE)
          expect(g.dispense(1)).toBe(water)
          g.open()
          g.fill(w)
          g.close()
          return
        }
        //not empty
        //water dispenseing should be 0 if s equals 0
        if (g.state() === State.ON_ACTIVE_BOIL) {
          advanceBy(1000)
          expect(g.temperature() > 25).toBe(true)
          expect(g.temperature() < 100).toBe(true)
          advanceBy(59000)
          expect(g.temperature() == 100).toBe(true)
          advanceBy(1)
          expect(g.temperature() == 100).toBe(true)
        }
        expect(g.state()).toBe(State.ON_ACTIVE_KEEP)
        if (s > 0) {
          expect(g.dispense(s)).not.toBe(0)
        }
      }),
    )
    clear()
  })
  it('can get temperature', () => {
    const g = new Goma1015()
    expect(g.temperature).toBeDefined()
    expect(g.temperature()).toBe(25)
  })
})
