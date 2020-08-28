import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { SystemService } from '@yuuvis/core';

@Component({
  selector: 'yuv-object-type-renderer',
  templateUrl: './object-type-renderer.component.html',
  styleUrls: ['./object-type-renderer.component.scss']
})
export class ObjectTypeRendererComponent implements ICellRendererAngularComp {
  iconSrc: string;
  title: string;

  constructor(private system: SystemService) {}

  refresh(params: any): boolean {
    this.iconSrc = this.system.getObjectTypeIconUri(params.value);
    this.title = this.system.getLocalizedResource(`${params.value}_label`);
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }
}
