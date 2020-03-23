export enum State {
  OFF = -1,
  OFF_OPEN,
  ON_IDLE,
  ON_OPEN,
  ON_ACTIVE_BOIL,
  ON_ACTIVE_KEEP,
}
/** Class GOMA-1015 http://www.sessame.jp/workinggroup/WorkingGroup2/POT_Specification.htm */
export class Goma1015 {
  /** to manage state transition */
  private _state: number
  /** start warning time to calculate water temperature  */
  private _start: number
  /** to manage water volume */
  private _water: number
  /** to manage temperature */
  private _temperature: number
  /**
   *
   * Create GOMA-1015
   *
   **/
  constructor() {
    this._state = State.OFF
    this._start = 0
    this._water = 0
    this._temperature = 25
  }
  /**
   * open the lid
   *
   * @return void
   *
   **/
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
  /**
   * close the lid
   *
   * @return void
   *
   **/
  close(): void {
    switch (this._state) {
      case State.OFF_OPEN:
        this._state = State.OFF
        break
      case State.ON_OPEN:
        this._state = State.ON_IDLE
        this.state()
        break
      default:
        break
    }
  }
  /**
   * plug the outlet
   *
   * @return void
   *
   **/
  plugIn(): void {
    switch (this._state) {
      case State.OFF:
        this._state = State.ON_IDLE
        this.state()
        break
      case State.OFF_OPEN:
        this._state = State.ON_OPEN
        break
      default:
        break
    }
  }
  /**
   * Unplug the outlet
   *
   * @return void
   *
   **/
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
  /**
   * check the current state
   *
   * @return state id:number
   *
   **/
  state(): number {
    switch (this._state) {
      case State.ON_ACTIVE_BOIL:
        // water is warmed 1.25 degree / sec to boil from 25 degree
        this._temperature = 25 + ((Date.now() - this._start) / 1000) * 1.25
        if (this._temperature >= 100) {
          this._temperature = 100
          this._state = State.ON_ACTIVE_KEEP
        }
        break
      case State.ON_ACTIVE_KEEP:
        // it gonna be IDLE it if it doesn't have enough water
        if (this._water < 10) {
          this._state = State.ON_IDLE
        }
        break
      case State.ON_IDLE:
        // it gonna boil it if it has enough water
        if (this._water >= 10) {
          this._start = Date.now()
          this._state = State.ON_ACTIVE_BOIL
        }
        break
      default:
        break
    }
    return this._state
  }
  /**
   * check the current tempearature
   *
   * @return tempearature degree:number
   *
   **/
  temperature(): number {
    this.state()
    return this._temperature
  }
  /**
   * check the current water volume
   *
   * @return water volume ml:number
   *
   **/
  water(): number {
    this.state()
    return this._water
  }
  /**
   * fill water
   *
   * @param water:number - how much water is filling
   * @return void
   *
   **/
  fill(water: number): void {
    if (water < 0) {
      throw new Error(`${JSON.stringify(this)} can't be filled with negative number`)
    }
    if (!(this._state === State.OFF_OPEN || this._state === State.ON_OPEN)) {
      throw new Error(`${JSON.stringify(this)} should be OPEN`)
    }
    if (this._water + water > 1000) {
      throw new Error(`${JSON.stringify(this)} is full`)
    }
    this._water += water
  }
  /**
   * push the dispense button
   *
   * @param sec:number - how long pressed
   * @return the volume of water pouring:number
   *
   **/
  dispense(sec: number): number {
    if (sec < 0) {
      throw new Error(`${JSON.stringify(this)} can't be dispensed with negative sec`)
    }
    if (!(this._state === State.ON_IDLE || this._state === State.ON_ACTIVE_KEEP)) {
      throw new Error(`${JSON.stringify(this)} should be IDLE or KEEP`)
    }
    const water = this._water
    this._water -= 10 * sec
    if (this._water < 0) {
      this._water = 0
    }
    this.state()
    return water - this._water
  }
  /**
   * push the reboil button
   * @return void
   *
   **/
  reboil(): void {
    if (this._state !== State.ON_ACTIVE_KEEP) {
      throw new Error(`${JSON.stringify(this)} should be KEEP`)
    }
    this._start = Date.now()
    this._state = State.ON_ACTIVE_BOIL
  }
}
