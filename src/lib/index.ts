class Goma1015 {
  private _isOpen: boolean
  constructor() {
    this._isOpen = false
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
}
export default Goma1015
