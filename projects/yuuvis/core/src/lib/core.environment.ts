export class YuvEnvironment {

    static isWebEnvironment() {
      return !YuvEnvironment.isDesktopEnvironment() && !YuvEnvironment.isMobileEnvironment()
    }
  
    static isMobileEnvironment() {
      return window.hasOwnProperty('cordova');
    }
  
    static isDesktopEnvironment() {
      return window.hasOwnProperty('process') && window['process'].versions.hasOwnProperty('electron');
    }
  }