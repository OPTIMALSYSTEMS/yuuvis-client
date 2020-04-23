# @yuuvis/framework

Component library for creating applications facing a yuuvis® MOMENTUM backend.

## Intentions

This library provides yuuvis developers with a collection of UI components for creating their own client applications.
It depends on `@yuuvis/framework` and is also the foundation of the yuuvis® client application.

## Installation

First you need to install the npm module:

```sh
npm install @yuuvis/framework --save
```

## Usage

#### 1. Import `YuvCoreModule`:

To use `@yuuvis/framework` in your Angular project you have to import `YuvCoreModule.forRoot()` in the root NgModule of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { YuvCoreModule } from '@yuuvis/framework';

@NgModule({
  imports: [BrowserModule, YuvCoreModule.forRoot()],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 2. Configure `YuvCoreModule`:

In order to use `@yuuvis/framework` library you need to provide a set of files that will configure the behaviour of the module.

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

The `@yuuvis/framework` library sets up a translations module that can be used within the application that you are creating. This module will be bound to the language a user has set up on the yuuvis® MOMENTUM backend. In order to be able to initialize this module the core config needs to know about where you store your translation files. By default they are supposed to be at `assets/default/i18n/`.

Inside those folder you then provide a file for each supported language (`en.json`, `de.json`). If you do not need translations, just provide empty files here.

##### Custom configuration locations

You are able to change the defaults for the configuration by providing different locations to the module config when you import `YuvFrameworkModule`.

```ts
@NgModule({
  imports: [
    YuvFrameworkModule.forRoot({
      main: ['assets/my-custom-path/config/main.json'],
      translations: ['assets/my-custom-path/i18n/']
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 3. Use `YuvFrameworkModule`:

Once you finshed steps one and two you are ready to go. Just use the components like any other UI component. For details check out `@yuuvis/framework` documentation.

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
