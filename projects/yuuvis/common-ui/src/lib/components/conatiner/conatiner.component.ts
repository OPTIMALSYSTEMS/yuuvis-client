import { Component, Input } from '@angular/core';

@Component({
  selector: 'yuv-conatiner',
  templateUrl: './conatiner.component.html',
  styleUrls: ['./conatiner.component.scss']
})
export class ConatinerComponent {
  @Input() title = '';
  @Input() description = '';
}
