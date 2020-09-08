import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { SystemService } from '@yuuvis/core';

/**
 * Component rendering an object type icon for a given object type.
 * Also implements ag-grids ICellRendererAngularComp so it can be used as cell
 * renderer component within a grid.
 *
 * @example
 * <yuv-object-type-icon [objectTypeId]></yuv-object-type-icon>
 */
@Component({
  selector: 'yuv-object-type-icon',
  templateUrl: './object-type-icon.component.html',
  styleUrls: ['./object-type-icon.component.scss']
})
export class ObjectTypeIconComponent implements ICellRendererAngularComp {
  /**
   * ID of an object type to render icon for
   */
  @Input() set objectTypeId(id: string) {
    this.refresh({ value: id });
  }

  iconSrc: string;
  title: string;

  constructor(private system: SystemService) {}

  refresh(params: any): boolean {
    this.iconSrc = params?.value ? this.system.getObjectTypeIconUri(params.value) : '';
    this.title = params?.value ? this.system.getLocalizedResource(`${params.value}_label`) : '';

    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }
}
