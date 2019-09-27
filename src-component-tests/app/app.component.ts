import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, YuvUser } from '@yuuvis/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  routes = [];
  user: YuvUser;

  @HostBinding('class.showNav') showNav: boolean;
  @HostBinding('class.dark') darkMode: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.userService.user$.subscribe(u => {
      this.user = u;
    });
  }

  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
