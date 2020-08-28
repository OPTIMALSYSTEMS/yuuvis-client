import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';

/**
 * Component used for rendering an svg icon within a grid cell.
 */
@Component({
  selector: 'yuv-icon-renderer',
  templateUrl: './icon-renderer.component.html',
  styleUrls: ['./icon-renderer.component.scss']
})
export class IconRendererComponent implements OnInit, ICellRendererAngularComp {
  iconSrc: string;

  constructor() {}

  refresh(params: any): boolean {
    // this.templateContext = {
    //   $implicit: params.data,
    //   params: params
    // };
    return true;
  }

  agInit(params: ICellRendererParams): void {
    // this.template = params['ngTemplate'];
    console.log(params);
    this.refresh(params);
  }

  ngOnInit(): void {}
}
