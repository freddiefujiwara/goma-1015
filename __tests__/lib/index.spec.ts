import fc from 'fast-check'

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
    expect(g.full).toBeDefined()

    //filling needs to be pot opened
    expect(() => g.fill(15)).toThrowError(/is not open/)

    //negative water
    g.open()
    expect(() => g.fill(-1)).toThrowError(/can't be filled with negative number/)
    expect(g.full()).toBe(false)

    //if full can not be filled water anymore
    //fill water 1,000 ml
    g.fill(1000)
    expect(g.full()).toBe(true)
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
        expect(g.full()).toBe(1000 == water)
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
    expect(() => g.dispense(15)).toThrowError(/plug should be inserted/)
    //dispenseing needs to be pot closed
    g.open()
    g.plugIn()
    g.plugIn()
    expect(() => g.dispense(15)).toThrowError(/is open/)
    g.close()

    //plugOff
    g.plugOff()
    g.plugOff()
    expect(() => g.dispense(15)).toThrowError(/plug should be inserted/)
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
    let sec = 0
    fc.assert(
      fc.property(fc.nat(10), fc.nat(1000), (s, w) => {
        //refill if empty
        //* water is dispenseed 10 ml/sec
        if (sec >= water / 10) {
          expect(g.dispense(s)).toBe(0)
          sec = 0
          water = w
          g.open()
          g.fill(water)
          g.close()
          return
        }
        //not empty
        //water dispenseing should be 0 if s equals 0
        expect(g.dispense(s) == 0).toBe(s == 0)
        sec += s
      }),
    )
  })
})
