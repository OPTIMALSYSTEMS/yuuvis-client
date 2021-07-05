export interface OpenIdConfig {
  host: string;
  tenant: string;
  issuer: string;
  clientId: string;
  // URL of the SPA to redirect the user to after login
  redirectUri?: string;
  postLogoutRedirectUri?: string;
}
