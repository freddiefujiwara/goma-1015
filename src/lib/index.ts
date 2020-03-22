export enum State {
  OFF = -1,
  OFF_OPEN,
  ON_IDLE,
  ON_OPEN,
  ON_ACTIVE_BOIL,
  ON_ACTIVE_KEEP,
}

export class Goma1015 {
  private _isOpen: boolean
  private _on: boolean
  private _water: number
  private _state: number
  constructor() {
    this._isOpen = false
    this._on = false
    this._water = 0
    this._state = State.OFF
  }
  open(): void {
    this._isOpen = true
  }
  close(): void {
    this._isOpen = false
  }
  plugIn(): void {
    this._on = true
  }
  plugOff(): void {
    this._on = false
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
  dispense(sec: number): number {
    if (sec < 0) {
      throw new Error(`${this} can't be dispensed with negative sec`)
    }
    if (this._isOpen) {
      throw new Error(`${this} is open`)
    }
    if (!this._on) {
      throw new Error(`${this} plug should be inserted`)
    }
    const water = this._water
    this._water -= 10 * sec
    if (this._water < 0) {
      this._water = 0
    }
    return water - this._water
  }
  reboil(): void {
    if (this._isOpen) {
      throw new Error(`${this} is open`)
    }
    if (!this._on) {
      throw new Error(`${this} plug should be inserted`)
    }
  }
}
