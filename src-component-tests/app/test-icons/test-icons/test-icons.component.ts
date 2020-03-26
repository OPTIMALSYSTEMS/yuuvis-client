import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import {
  addCircle,
  arrowDown,
  arrowLast,
  arrowNext,
  clear,
  cloudUpload,
  contentDownload,
  contentUpload,
  datepicker,
  deleteIcon,
  done,
  edit,
  envelope,
  favorite,
  finalized,
  folder,
  globe,
  info,
  kebap,
  lock,
  navBack,
  noFile,
  refresh,
  resubmission,
  search,
  searchFilter,
  subscription,
  verticalSplit
} from './../../../../projects/yuuvis/framework/src/lib/svg.generated';

@Component({
  selector: 'yuv-test-icons',
  templateUrl: './test-icons.component.html',
  styleUrls: ['./test-icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestIconsComponent implements OnInit {
  private _width = 50;
  svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" /></svg>';

  sourceSVG: string = null;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([
      addCircle,
      arrowDown,
      arrowLast,
      arrowNext,
      clear,
      cloudUpload,
      contentDownload,
      contentUpload,
      datepicker,
      deleteIcon,
      done,
      edit,
      envelope,
      favorite,
      finalized,
      folder,
      globe,
      info,
      kebap,
      lock,
      navBack,
      noFile,
      refresh,
      resubmission,
      searchFilter,
      search,
      subscription,
      verticalSplit
    ]);
  }

  set width(w: number) {
    this._width = w;
  }

  get width(): number {
    return this._width;
  }

  onChange(e: number) {
    this.width = e;
  }

  ngOnInit() {}
}
