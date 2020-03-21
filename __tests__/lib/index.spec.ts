import fc from 'fast-check'

import Goma1015 from '../../src/lib/index'

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
    expect(g.isOpen).toBeDefined()

    //default is close
    expect(g.isOpen()).toBe(false)

    //Property based testing for open/close
    fc.assert(
      fc.property(fc.boolean(), b => {
        if (b) {
          g.open()
          expect(g.isOpen()).toBe(true)
          return
        }
        g.close()
        expect(g.isOpen()).toBe(false)
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

    //full can be filled
    g.fill(1000)
    expect(g.full()).toBe(true)
    expect(() => g.fill(1)).toThrowError(/is full/)

    //Property based testing for fill
    g = new Goma1015()
    g.open()
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
  it('can pour', () => {
    let g = new Goma1015()
    //check definition
    expect(g.pour).toBeDefined()

    //pouring needs to be pot closed
    g.open()
    expect(() => g.pour(15)).toThrowError(/is open/)
    g.close()

    //negative sec
    expect(() => g.pour(-1)).toThrowError(/can't be poured with negative sec/)
    expect(g.pour(100)).toBe(0)

    //Property based testing for pour
    g = new Goma1015()
    //fill to full
    g.open()
    g.fill(1000)
    g.close()
    let sec = 0
    fc.assert(
      fc.property(fc.nat(10), s => {
        //empty or 0 sec
        if (sec >= 100 || s == 0) {
          expect(g.pour(s)).toBe(0)
          return
        }
        //not empty
        expect(g.pour(s)).not.toBe(0)
        sec += s
        expect(g.full()).toBe(sec == 0)
      }),
    )
  })
})