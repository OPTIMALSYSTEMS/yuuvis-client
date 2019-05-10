import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const detectIE = () => {
  let ua = window.navigator.userAgent;
  let msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }
  let trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    let rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }
  // other browser
  return -1;
};

const version = detectIE();
if (version > 0 && version <= 11) {
  alert('Internet Explorer 11 and below is not supported. Please use a current version of Google Chrome, Firefox or Microsoft Edge instead.');
} else {

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch(err => {
//     alert('App could not be initialzed');
//   });

if (!!window['cordova']) {
  document.addEventListener('deviceready', () => {
    console.log('deviceready');
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.log(err));
  }, false);
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
}

}