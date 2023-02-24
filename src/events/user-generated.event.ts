export class UserGeneratedEvent {
  public readonly email: string;
  public readonly name: string;

  constructor(email: string, name: string) {
    this.email = email;
    this.name = name;
  }
}
