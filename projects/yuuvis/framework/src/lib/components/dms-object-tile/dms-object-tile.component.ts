import { Component, Input } from '@angular/core';

/**
 * Component rendering a dms object as a tile
 */
@Component({
  selector: 'yuv-dms-object-tile',
  templateUrl: './dms-object-tile.component.html',
  styleUrls: ['./dms-object-tile.component.scss']
})
export class DmsObjectTileComponent {
  @Input() title: string;
  @Input() description: string;
  // @Input() objectId: string;
  // @Input() objectTypeId: string;
  @Input() objectTypeIcon: string;
  @Input() objectTypeLabel: string;
  @Input() date: Date;
}
