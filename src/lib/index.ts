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
  private _temperature: number
  private _state: number
  private _start: number
  constructor() {
    this._water = 0
    this._temperature = 25
    this._start = 0
    this._state = State.OFF
  }
  open(): void {
    switch (this._state) {
      case State.OFF:
        this._state = State.OFF_OPEN
        break
      case State.ON_IDLE:
      case State.ON_ACTIVE_BOIL:
      case State.ON_ACTIVE_KEEP:
        this._state = State.ON_OPEN
        this._temperature = 25
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
        if (this._water > 10) {
          this._start = Date.now()
          this._state = State.ON_ACTIVE_BOIL
        }
        break
      default:
        break
    }
  }
  plugIn(): void {
    switch (this._state) {
      case State.OFF:
        this._state = State.ON_IDLE
        if (this._water > 10) {
          this._start = Date.now()
          this._state = State.ON_ACTIVE_BOIL
        }
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
      case State.ON_ACTIVE_BOIL:
      case State.ON_ACTIVE_KEEP:
        this._state = State.OFF
        this._temperature = 25
        break
      case State.ON_OPEN:
        this._state = State.OFF_OPEN
        break
      default:
        break
    }
  }
  state(): number {
    if (this._state === State.ON_ACTIVE_BOIL) {
      this._temperature = ((Date.now() - this._start) / 1000) * 1.25
      if (this._temperature > 100) {
        this._temperature = 100
        this._state = State.ON_ACTIVE_KEEP
      }
    }
    return this._state
  }
  temperature(): number {
    return this._temperature
  }
  fill(water: number): void {
    if (water < 0) {
      throw new Error(`${JSON.stringify(this)} can't be filled with negative number`)
    }
    if (!(this._state === State.OFF_OPEN || this._state === State.ON_OPEN)) {
      throw new Error(`${JSON.stringify(this)} is not open`)
    }
    if (this._water + water > 1000) {
      throw new Error(`${JSON.stringify(this)} is full`)
    }
    this._water += water
  }
  full(): boolean {
    return this._water >= 1000
  }
  dispense(sec: number): number {
    if (sec < 0) {
      throw new Error(`${JSON.stringify(this)} can't be dispensed with negative sec`)
    }
    if (this._state === State.OFF_OPEN || this._state === State.ON_OPEN) {
      throw new Error(`${JSON.stringify(this)} is open`)
    }
    if (!(this._state === State.ON_IDLE || this._state === State.ON_ACTIVE_KEEP)) {
      throw new Error(`${JSON.stringify(this)} plug should be inserted`)
    }
    const water = this._water
    this._water -= 10 * sec
    if (this._water < 0) {
      this._water = 0
    }
    if (this._state === State.ON_ACTIVE_KEEP && this._water < 10) {
      this._state = State.ON_IDLE
    }
    return water - this._water
  }
}
