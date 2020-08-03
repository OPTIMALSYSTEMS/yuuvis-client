import { Component, Input } from '@angular/core';
import { ReferenceEntry } from '../reference.interface';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-reference-item',
  templateUrl: './reference-item.component.html',
  styleUrls: ['./reference-item.component.scss']
})
export class ReferenceItemComponent {
  @Input() item: ReferenceEntry;

  constructor() {}

  detailsClicked(event) {
    event.stopPropagation();
  }
}
