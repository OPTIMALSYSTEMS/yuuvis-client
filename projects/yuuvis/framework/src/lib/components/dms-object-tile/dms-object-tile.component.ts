import { Component, Input } from '@angular/core';

/**
 * Component rendering a dms object as a tile
 * @example
 *  <yuv-dms-object-tile [title]="i.title"  [description]="i.description" [objectTypeIcon]="i.objectTypeIcon" [objectTypeLabel]="i.objectTypeLabel"
    [date]="i.date" (click)="someFunction(argument, $event)"></yuv-dms-object-tile>
 */
@Component({
  selector: 'yuv-dms-object-tile',
  templateUrl: './dms-object-tile.component.html',
  styleUrls: ['./dms-object-tile.component.scss']
})
export class DmsObjectTileComponent {
  /**
   * Provides a titel from dms object
   */
  @Input() title: string;

  /**
   * Provides a description from dms object
   */
  @Input() description: string;
  // @Input() objectId: string;
  // @Input() objectTypeId: string;

  /**
   * Provides icons from dms object
   */
  @Input() objectTypeIcon: string;
  /**
   * Provides label from dms object
   */
  @Input() objectTypeLabel: string;

  /**
   * Provides date
   */
  @Input() date: Date;
}
