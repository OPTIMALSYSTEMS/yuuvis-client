import { ConfigService } from "@yuuvis/core";

export const noAccessTitle = '! *******';

export class YuvComponentRegister {
  private static reg = new Map<string, any>();

  static register(cmps: any[]) {
    cmps.forEach((c) => this.setComponent(c));
  }

  static setComponent(value: any, name?: string) {
    this.reg.set(name || this.getSelector(value), value);
  }

  static getSelector(value: any) {
    return value.ɵcmp.selectors[0][0];
  }

  static getComponent(name: string): any | undefined {
    return this.reg.get(name);
  }
}

export type ViewMode = 'standard' | 'horizontal' | 'grid' | 'auto';

export abstract class YuvGridOptions {
  
  pageSizeOptions = [20, 50, 100];
  rowHeightOptions = [50, 60, 70];
  viewModeOptions: ViewMode[] = ['standard', 'grid', 'horizontal'];

  currentPageSize = 50;
  currentRowHeight = 70;
  currentViewMode: ViewMode = 'auto';

  constructor(public config: ConfigService) {
    this.currentViewMode = localStorage.getItem('yuv.grid.options.viewMode') as ViewMode || this.currentViewMode;

    this.rowHeightOptions = this.config.get('core.gridOptions.rowHeightOptions') || this.rowHeightOptions;
    this.currentRowHeight = parseInt(localStorage.getItem('yuv.grid.options.rowHeight') || '0') || this.config.get('core.gridOptions.rowHeight') || this.currentRowHeight;
    if (!this.rowHeightOptions.includes(this.currentRowHeight))
      this.rowHeightOptions = [this.currentRowHeight, ...this.rowHeightOptions].sort();

    this.pageSizeOptions = this.config.get('core.gridOptions.pageSizeOptions') || this.pageSizeOptions;
    this.currentPageSize = parseInt(localStorage.getItem('yuv.grid.options.pageSize') || '0') || this.config.get('core.gridOptions.pageSize') || this.currentPageSize;
    if (!this.pageSizeOptions.includes(this.currentPageSize))
      this.pageSizeOptions = [this.currentPageSize, ...this.pageSizeOptions].sort();
  }

  setPageSize(size: number) {
    localStorage.setItem('yuv.grid.options.pageSize', size.toString());
    this.currentPageSize = size;
  }

  setRowHeight(rowHeight: number) {
    localStorage.setItem('yuv.grid.options.rowHeight', rowHeight.toString());
    this.currentRowHeight = rowHeight;
  }

  setViewMode(viewMode: ViewMode) {
    viewMode = viewMode === this.currentViewMode ? 'auto' : viewMode; // toggle to auto mode
    localStorage.setItem('yuv.grid.options.viewMode', viewMode);
    this.currentViewMode = viewMode;
  }
}