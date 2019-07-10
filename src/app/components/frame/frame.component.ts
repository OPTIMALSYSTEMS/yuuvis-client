import { Component, HostBinding, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService, YuvUser } from '@yuuvis/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  @HostBinding('class.transparentAppBar') tab: boolean;
  hideAppBar = false;
  showSideBar = false;
  user: YuvUser;

  constructor(private router: Router, private userService: UserService) {}

  navigate(state: string) {
    this.showSideBar = false;
    this.router.navigate([state]);
  }

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.tab =
          e.urlAfterRedirects.startsWith('/dashboard') ||
          e.urlAfterRedirects.startsWith('/enter');
        this.hideAppBar = e.urlAfterRedirects.startsWith('/enter');
      });
  }
}
