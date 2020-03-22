export enum State {
  OFF = -1,
  OFF_OPEN,
  ON_IDLE,
  ON_OPEN,
  ON_ACTIVE_BOIL,
  ON_ACTIVE_KEEP,
}

export class Goma1015 {
  private _water: number
  private _state: number
  constructor() {
    this._water = 0
    this._state = State.OFF
  }
  open(): void {
    switch (this._state) {
      case State.OFF:
        this._state = State.OFF_OPEN
        break
      case State.ON_IDLE:
        this._state = State.ON_OPEN
        break
      default:
        break
    }
  }
  close(): void {
    switch (this._state) {
      case State.OFF_OPEN:
        this._state = State.OFF
        break
      case State.ON_OPEN:
        this._state = State.ON_IDLE
        break
      default:
        break
    }
  }
  plugIn(): void {
    switch (this._state) {
      case State.OFF:
        this._state = State.ON_IDLE
        break
      case State.OFF_OPEN:
        this._state = State.ON_OPEN
        break
      default:
        break
    }
  }
  plugOff(): void {
    switch (this._state) {
      case State.ON_IDLE:
        this._state = State.OFF
        break
      case State.ON_OPEN:
        this._state = State.OFF_OPEN
        break
      default:
        break
    }
  }
  isOpen(): boolean {
    return this._state === State.OFF_OPEN || this._state === State.ON_OPEN
  }
  fill(water: number): void {
    if (water < 0) {
      throw new Error(`${this} can't be filled with negative number`)
    }
    if (!this.isOpen()) {
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
    if (this.isOpen()) {
      throw new Error(`${this} is open`)
    }
    if (this._state !== State.ON_IDLE) {
      throw new Error(`${this} plug should be inserted`)
    }
    const water = this._water
    this._water -= 10 * sec
    if (this._water < 0) {
      this._water = 0
    }
    return water - this._water
  }
}
