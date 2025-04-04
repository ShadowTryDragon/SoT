export class SessionCrewData {
  public lastSeen: Date;
  #active: boolean;
  constructor(
    public gamertag: string,
    public firstSeen: Date = new Date(),
  ) {
    this.lastSeen = this.firstSeen;
    this.#active = true;
  }

  seen(now: Date = new Date()): void {
    if (!this.active) {
      // TODO: throw?
      return;
    }
    this.lastSeen = now;
  }

  deactivate(): void {
    this.#active = false;
  }

  get active(): boolean {
    return this.#active;
  }
}
