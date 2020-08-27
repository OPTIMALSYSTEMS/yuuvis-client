import { Component, Input } from '@angular/core';
import { SystemService } from '@yuuvis/core';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';

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
  iconHTML: string = '';

  /**
   * Provides a titel from dms object
   */
  @Input() title: string;

  /**
   * Provides a description from dms object
   */
  @Input() description: string;
  // @Input() objectId: string;
  @Input() set objectTypeId(id: string) {
    // this.iconHTML = '....';

    this.iconHTML = CellRenderer.typeCellRenderer({
      value: id,
      context: {
        system: this.systemService
      }
    });
  }

  /**
   * HTML snippet of the object types icon
   */
  // @Input() objectTypeIconHTML: string;
  /**
   * Provides label from dms object
   */
  @Input() objectTypeLabel: string;

  /**
   * Provides date
   */
  @Input() date: Date;

  constructor(private systemService: SystemService) {}
}
