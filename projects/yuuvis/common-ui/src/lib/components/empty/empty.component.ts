import { Component, Input } from '@angular/core';

@Component({
  selector: 'yuv-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent {
  @Input() icon: string;
}
