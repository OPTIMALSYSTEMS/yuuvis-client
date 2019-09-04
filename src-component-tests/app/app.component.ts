import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, YuvUser } from '@yuuvis/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  routes = [];
  loginForm: FormGroup;
  defaultTenant = 'kolibri';
  credentialsSet: boolean;
  loggedIn: boolean;
  user: YuvUser;

  @HostBinding('class.showNav') showNav: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private appService: AppService
  ) {
    this.loginForm = this.fb.group({
      tenant: [this.defaultTenant, Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (location.href.indexOf('cypress') !== -1) {
      this.loggedIn = true;
    } else {
      this.appService.credentials$.subscribe(c => {
        this.credentialsSet = !!c;
        if (c) {
          this.userService.fetchUserSettings().subscribe();
        }
      });
      this.userService.user$.subscribe(u => {
        this.user = u;
        this.loggedIn = !!u;
      });
    }
  }

  login() {
    this.appService.setCredentials(this.loginForm.value.tenant, this.loginForm.value.username, this.loginForm.value.password);
  }

  logout() {
    this.appService.clearCredentials();
  }

  ngOnInit() {
    console.log(location.href.indexOf('cypress') !== -1);
    this.routes = this.router.config.map(c => c.path);
  }
}
