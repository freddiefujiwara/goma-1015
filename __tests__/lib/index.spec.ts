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
    expect(g.open).toBeDefined()
    expect(g.close).toBeDefined()
    expect(g.isOpen).toBeDefined()
    expect(g.isOpen()).toBe(false)
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
    expect(g.fill).toBeDefined()
    expect(() => g.fill(15)).toThrowError(/is not open/)
    g.open()
    expect(() => g.fill(-1)).toThrowError(/can't be filled with negative number/)
    expect(g.full).toBeDefined()
    expect(g.full()).toBe(false)
    g.fill(1000)
    expect(g.full()).toBe(true)
    expect(() => g.fill(1)).toThrowError(/is full/)
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
})
