# @yuuvis/core

`@yuuvis/core` library provides a set of services to interact with a yuuvis MOMENTUM backend.

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
      "api-web": "/api-web"
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

The `@yuuvis/core` library sets up a translations module that can be used within the application that you are creating. This module will be bound to the language a user has set up on the yuuvis MOMENTUM backend. In order to be able to initialize this module the core config needs to know about where you store your translation files. By default they are supposed to be at `assets/default/i18n/`.

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
