import { Component } from '@angular/core';
import { Direction, UserService, YuvUser } from '@yuuvis/core';

@Component({
  selector: 'yuv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  direction: string = Direction.LTR;

  constructor(private userService: UserService) {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.direction = user.uiDirection;
    });
  }
}
