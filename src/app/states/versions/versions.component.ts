import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DmsObject, PendingChangesService, Screen, ScreenService, TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.versions';
  versions: string[] = [];
  dmsObjectID: string;
  dmsObject: DmsObject;
  dmsObject2: DmsObject;
  smallScreen: boolean;

  get layoutOptionsKey() {
    return this.STORAGE_KEY;
  }

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private pendingChanges: PendingChangesService,
    private route: ActivatedRoute
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
  }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.versions = [];
    }
  }

  dmsObjectsSelected(objects: DmsObject[]) {
    [this.dmsObject, this.dmsObject2] = objects;
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.versions.header.title'));
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.dmsObjectID = params.id;
      }
    });
    // extract the versions from the route params
    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe(params => {
      this.versions = [params.get('version'), params.get('version2')];
    });
  }

  ngOnDestroy() {}
}
