/**
 * User account configuration
 */
export class YuvUser {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  title: string;
  email: string;
  image: string;
  tenant: string;
  domain: string;
  authorities: string[];
  substituteOf: string[];
  enabled: boolean;

  /**
   * User settings
   */
  uiDirection: string;
  /**
   * User settings
   */
  userSettings: UserSettings;
  /**
   * @ignore
   */
  constructor(json: any, userSettings: UserSettings) {
    this.id = json.id;
    this.username = json.username;
    this.firstname = json.firstname;
    this.lastname = json.lastname;
    this.email = json.email;
    this.image = json.image;
    this.title = json.title;
    this.tenant = json.tenant;
    this.domain = json.domain;
    this.authorities = json.authorities;
    this.substituteOf = json.substituteOf;
    this.enabled = json.enabled;

    this.userSettings = userSettings;
    this.setTitle();
  }

  private setTitle() {
    if (!this.title) {
      this.title = this.firstname && this.lastname ? `${this.lastname}, ${this.firstname} (${this.username})` : this.username;
    }
  }

  /**
   * Gets the users configured client locale
   * @returns locale string
   */
  public getClientLocale(): string {
    return this.userSettings.locale || 'en';
  }

  public getFullName(): string {
    return `${this.lastname}, ${this.firstname})`;
  }

  public getDisplayNameName(): string {
    return `${this.lastname}, ${this.firstname} (${this.username})`;
  }
}
/**
 * Interface for user settings
 */
export interface UserSettings {
  locale: string;
}
