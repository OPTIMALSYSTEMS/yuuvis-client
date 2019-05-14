
// Result when calling loginDevice endpoint in cloud environment
// when using device flow
export interface LoginDeviceResult {
    user_code: string;
    device_code: string;
    interval: number;
    verification_uri: string;
    expires_in: number;
  }
  
  export interface StoredToken {
    accessToken: string;
    tenant: string;
  }

  // State emitted by the login function when using the device flow
  export interface LoginState {
      name: LoginStateName;
      data: any;
  }

  export enum LoginStateName {
    STATE_LOGIN_URI = 'login.uri',
    STATE_DONE = 'login.done',
    STATE_CANCELED = 'login.canceled',
  }