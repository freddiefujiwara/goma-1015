class Goma1015 {
  private _isOpen: boolean
  private _water: number
  constructor() {
    this._isOpen = false
    this._water = 0
  }
  open(): void {
    this._isOpen = true
  }
  close(): void {
    this._isOpen = false
  }
  isOpen(): boolean {
    return this._isOpen
  }
  fill(water: number): void {
    if (water < 0) {
      throw new Error(`${this} can't be filled with negative number`)
    }
    if (!this._isOpen) {
      throw new Error(`${this} is not open`)
    }
    if (this._water + water > 1000) {
      throw new Error(`${this} is full`)
    }
    this._water += water
  }
  full(): boolean {
    return this._water >= 1000
  }
}
export default Goma1015
