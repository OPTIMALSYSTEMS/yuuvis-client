import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  credentialsOff: boolean;
  user: YuvUser;

  @HostBinding('class.showNav') showNav: boolean;

  constructor(private router: Router, private fb: FormBuilder, private userService: UserService, private appService: AppService) {
    this.loginForm = this.fb.group({
      tenant: [this.defaultTenant, Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.appService.credentials$.subscribe(c => {
      this.credentialsSet = !!c;
    });
    this.userService.user$.subscribe(u => {
      this.user = u;
    });
  }

  login() {
    this.appService.setCredentials(this.loginForm.value.tenant, this.loginForm.value.username, this.loginForm.value.password);
  }

  toggleAuth() {
    this.credentialsOff = this.appService.toggleCredentials();
  }

  clear() {
    this.appService.clearCredentials();
  }

  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
