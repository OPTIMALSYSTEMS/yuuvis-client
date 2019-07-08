import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'yuv-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  constructor(private router: Router) {}

  private navigating() {
    return this.router.navigate([{ outlets: { modal: null } }]);
  }

  hide() {
    this.navigating();
  }

  navigate(state: string) {
    this.navigating().then(() => this.router.navigate([state]));
  }

  ngOnInit() {}
}
