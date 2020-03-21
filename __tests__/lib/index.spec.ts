import Goma1015 from '../../src/lib/index'

describe('Goma1015', () => {
  it('can create new instance', () => {
    const g = new Goma1015()
    expect(g).not.toBeNull()
    expect(g).toBeInstanceOf(Goma1015)
  })
})
