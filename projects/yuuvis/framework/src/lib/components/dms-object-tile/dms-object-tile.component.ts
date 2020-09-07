import { Component, Input } from '@angular/core';

/**
 * Component rendering a dms object as a tile
 * 
 * [Screenshot](../assets/images/yuv-dms-object-tile.gif)
 * 
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
   * Titel of dms object
   */
  @Input() title: string;

  /**
   * Description of dms object
   */
  @Input() description: string;
  /**
   * ID of the dms objects object type
   */
  @Input() objectTypeId: string;
  /**
   * Label of dms object
   */
  @Input() objectTypeLabel: string;

  /**
   * Date to be shown in the tile (e.g. create date/modification date)
   */
  @Input() date: Date;

  constructor() {}
}
