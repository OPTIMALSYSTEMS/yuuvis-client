import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'component-tests';

  routes = [];

  @HostBinding('class.showNav') showNav: boolean;

  constructor(private router: Router) {}
  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
