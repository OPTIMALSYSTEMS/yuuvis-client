import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'yuv-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  constructor(private router: Router) {}

  hide() {
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  navigate(state: string) {
    this.router
      .navigate([{ outlets: { modal: null } }])
      .then(() => this.router.navigate([state]));
  }

  ngOnInit() {}
}
