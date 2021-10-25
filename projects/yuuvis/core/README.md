# @yuuvis/core

`@yuuvis/core` library provides a set of services to interact with a yuuvis® MOMENTUM backend.

## Installation

First you need to install the npm module:

```sh
npm install @yuuvis/core --save
```

## Usage

#### 1. Import `YuvCoreModule`:

To use `@yuuvis/core` in your Angular project you have to import `YuvCoreModule.forRoot()` in the root NgModule of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { YuvCoreModule } from '@yuuvis/core';

@NgModule({
  imports: [BrowserModule, YuvCoreModule.forRoot()],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 2. Configure `YuvCoreModule`:

In order to use `@yuuvis/core` library you need to provide a set of files that will configure the behaviour of the module.

##### Main configuration

The main configuration file is supposed to be located at `assets/default/config/main.json`. By default it looks like this:

```json
{
  "core": {
    "apiBase": {
      "core": "/api",
      "api-web": "/api-web/api"
    },
    "languages": [
      {
        "iso": "de",
        "label": "Deutsch"
      },
      {
        "iso": "en",
        "label": "English",
        "fallback": true
      }
    ],
    "logging": {
      "level": "debug"
    }
  }
}
```

##### Translations

The `@yuuvis/core` library sets up a translations module that can be used within the application that you are creating. This module will be bound to the language a user has set up on the yuuvis® MOMENTUM backend. In order to be able to initialize this module the core config needs to know about where you store your translation files. By default they are supposed to be at `assets/default/i18n/`.

Inside those folder you then provide a file for each supported language (`en.json`, `de.json`). If you do not need translations, just provide empty files here.

##### Custom configuration locations

You are able to change the defaults for the configuration by providing different locations to the module config when you import `YuvCoreModule`.

```ts
@NgModule({
  imports: [
    YuvCoreModule.forRoot({
      main: ['assets/my-custom-path/config/main.json'],
      translations: ['assets/my-custom-path/i18n/']
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 3. Use `YuvCoreModule`:

Once you finshed steps one and two you are ready to go. Just inject the services you need into the component like you're used to do.

```ts
import { UserService } from '@yuuvis/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private userService: UserService) {}
}
```

### Running clients outside of yuuvis infrastructure

By default client applications bulit with @yuuvis/core library are supposed to be located inside of the yuuvis infrastructure. In this case authentication
will be handled by the authentication service (Gateway). The library itself does not care about it at all.

But in some cases you may want to create clients that are deployed/hosted somewhere else and may face different yuuvis backends. For this scenario the core
library provides the ability to use OpenID Connect for authentication.

#### Setup Keycloak

In order to use this way of authenticating you need to setup a client inside your keycloak realm that will be used to trigger login:

```ts
Client ID: 'spa-client' // choose you own name
Client Protocol: 'openid-connect'
Access Type: 'public'
Valid Redirect URIs: // match your environment
Web Origins: '+' // means: everything that's also in valid redirect uris

Advanced Settings
Proof Key for Code Exchange Code Challenge Method: 'S256'
```

There are several ways how to setup your project to support this kind of authentication:

#### Use main.json config file

Create a file `main.json` and put it into the root directory of your assets folder:

```ts
// ./src/assets/default/main.json
{
  core: {
    ...
  },
  oidc: {
    "host": "https://kolibri.enaioci.net",  // yuuvis backend URI
    "tenant": "kolibri",  // yuuvis tenant (equals Keycloak realm)
    "issuer": "https://auth.enaioci.net/auth/realms/kolibri",
    "clientId": "spa-client",
  }
}

```

#### Use module config

You could also provide this configuration when importing `YuvCoreModule`:

```ts
// app.module.ts

imports: [
    YuvCoreModule.forRoot({
      // ... other config values
      oidc: {
        host: "https://kolibri.enaioci.net",
        tenant: "kolibri",
        issuer: "https://auth.enaioci.net/auth/realms/kolibri",
        clientId: "spa-client",
      }
    })
  ],
```

#### Dynamic initialization

In case you do not know about this properties when your application starts (OIDC profile needs to be loaded or user pick one of several profiles) you will just import `YuvCoreModule` without OIDC config. This will cause some console errors that could be ignored. They are caused by the library trying to intialize the 'old way'.

Once you know about the OIDC config you can re-trigger initialization of core module:

```ts
export class AppComponent {
  constructor(@Inject(CORE_CONFIG) private coreConfig: CoreConfig, private coreInit: CoreInit) {}

  login(target: OpenIdConfig) {
    this.coreConfig.oidc = {
      host: 'https://kolibri.enaioci.net',
      tenant: 'kolibri',
      issuer: 'https://auth.enaioci.net/auth/realms/kolibri',
      clientId: 'spa-client'
    };
    this.coreInit.initialize();
  }
}
```

### Troubleshooting

Make sure that your project is running on a recent Angular version. If you are not yet on Angular 9, update your project:

```sh
 `ng update @angular/cli@^9 @angular/core@^9`.
```

You may also want to update your global Angular CLI to version 9:

```sh
npm uninstall -g @angular/cli
npm cache verify
# if npm version is < 5 then use `npm cache clean`
npm install -g @angular/cli@latest
```
