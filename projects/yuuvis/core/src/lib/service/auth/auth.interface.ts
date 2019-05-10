
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
  