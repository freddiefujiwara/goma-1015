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
})
