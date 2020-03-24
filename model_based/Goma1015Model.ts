import fc from 'fast-check'

import { Goma1015, State } from '../src/lib/index'

/** Class Goma1015Model */
export class Goma1015Model {
  /** to manage state transition */
  public state: number
  /** to manage water volume */
  public water: number
  /** to manage temperature */
  public temperature: number
  constructor() {
    this.state = State.OFF_CLOSE
    this.water = 0
    this.temperature = 25
  }
}

export type Goma1015Command = fc.Command<Goma1015Model, Goma1015>
