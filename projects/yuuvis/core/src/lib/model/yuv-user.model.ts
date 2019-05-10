
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

    // user settings
    uiDirection: string;
    userSettings: UserSettings;

    constructor(json: any) {
        this.id = json.id;
        this.username = json.username;
        this.firstname = json.firstname;
        this.lastname = json.lastname;
        this.email = json.email;
        this.title = json.title;
        this.tenant = json.tenant;
        this.domain = json.domain;
        this.authorities = json.authorities;
        this.substituteOf = json.substituteOf;
        this.enabled = json.enabled;

        // TODO: set from user settings
        this.userSettings = {
            locales: {
                client: 'en',
                schema: 'en'
            }
        }
    }

    /**
     * Gets the users configured client locale
     * @returns locale string
     */
    public getClientLocale(): string {
        return this.userSettings.locales.client;
    }

    /**
     * Gets the users configured schema locale
     * @returns locale string
     */
    public getSchemaLocale(): string {
        return this.userSettings.locales.schema;
    }
}

export interface UserSettings {
    locales: {
        client: string;
        schema: string;
    }
}