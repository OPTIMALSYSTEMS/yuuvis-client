import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppCacheService,
  AuthService,
  CoreConfig,
  CORE_CONFIG,
  LoginStateName,
  TranslateService,
  Utils,
  YuvEnvironment
} from '@yuuvis/core';
import { finalize } from 'rxjs/operators';
import { AuthFlowService } from 'src/app/platform/auth-flow/auth-flow.service';

@Component({
  selector: 'yuv-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: { class: 'themeBackground' }
})
export class LoginComponent implements OnInit {
  private STORAGE_KEY = 'yuv.login.host';

  private returnUrl: string;
  @HostBinding('class.invalid') invalid: boolean;
  @HostBinding('class.loading') loading: boolean;
  form: any = {};
  deviceFlow = {
    // whether or not device flow is used to login
    active: false,
    // login page received from the backends authentication service
    loginPageUri: null
    // loginPageUri: this.sanitizer.bypassSecurityTrustResourceUrl('https://kolibri.enaioci.net'),
  };

  private loginCancelTrigger;

  constructor(
    @Inject(CORE_CONFIG) public coreConfig: CoreConfig,
    private route: ActivatedRoute,
    private router: Router,
    private authFlowService: AuthFlowService,
    private sanitizer: DomSanitizer,
    private appCache: AppCacheService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.deviceFlow.active =
      !this.coreConfig.environment.production ||
      !YuvEnvironment.isWebEnvironment();
  }

  ngOnInit() {
    if (this.deviceFlow.active) {
      this.appCache.getItem(this.STORAGE_KEY).subscribe(res => {
        if (res) {
          this.form.host = res;
        }
      });
    }

    if (this.route.snapshot.paramMap.get('logout')) {
      this.authService.logout(true);
      this.router.navigate(['/']);
    }
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    // because returnUrl was fetched from location, we need to grab the actual route
    const currentLoc = location.href.substr(location.origin.length);

    const prefix = currentLoc.substring(0, currentLoc.indexOf('/enter'));
    this.returnUrl = this.returnUrl
      .replace(prefix, '')
      .replace('index.html', '');

    // loading login state as the user is already authenticated will redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl || '/');
    } else {
      // if there is no logged in user, select the browsers language for the login dialog
      let browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/en|de/) ? browserLang : 'en');
    }
  }

  login() {
    this.loading = true;
    this.invalid = false;

    if (this.deviceFlow.active) {
      this.appCache.setItem(this.STORAGE_KEY, this.form.host).subscribe();
    }

    const loginFlow = this.authService.startLoginFlow(
      this.form.tenant,
      this.form.host
    );

    // get a hold on the trigger to stop the login flow at any point
    this.loginCancelTrigger = loginFlow.cancelTrigger;

    // subscribe to the current state of the login flow
    loginFlow.loginState.pipe(finalize(() => (this.loading = false))).subscribe(
      loginState => {
        switch (loginState.name) {
          case LoginStateName.STATE_LOGIN_URI: {
            // open login target uri in iframe

            // running in iframe
            this.deviceFlow.loginPageUri = this.sanitizer.bypassSecurityTrustResourceUrl(
              loginState.data
            );

            // this.authFlowService.openLoginUri(loginState.data, this.loginCancelTrigger);
            break;
          }
          case LoginStateName.STATE_CANCELED: {
            this.finishLogin();
            break;
          }
          case LoginStateName.STATE_DONE: {
            this.finishLogin();
            this.authFlowService.close();
            this.router.navigateByUrl(this.returnUrl || '/');
            break;
          }
        }
      },
      Utils.throw(() => {
        this.finishLogin();
        this.invalid = true;
      })
    );
  }

  cancelLogin() {
    if (this.loginCancelTrigger) {
      this.loginCancelTrigger.next();
    }
    this.finishLogin();
  }

  private finishLogin() {
    this.loginCancelTrigger = null;
    this.deviceFlow.loginPageUri = null;
  }
}
