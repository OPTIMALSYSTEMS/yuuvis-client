import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DmsObject, PendingChangesService, Screen, ScreenService, TranslateService } from '@yuuvis/core';
import { ObjectCompareInput, PluginsService, VersionListComponent } from '@yuuvis/framework';

@Component({
  selector: 'yuv-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.versions';

  @ViewChild('versionList', { static: true }) versionList: VersionListComponent;

  versions: number[] = [];
  dmsObjectID: string;
  dmsObject: DmsObject;

  selection: DmsObject[];
  compare: ObjectCompareInput;
  smallScreen: boolean;

  get layoutOptionsKey() {
    return this.STORAGE_KEY;
  }

  plugins: any;
  pluginsCompare: any;

  constructor(
    private screenService: ScreenService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private pendingChanges: PendingChangesService,
    private route: ActivatedRoute,
    private router: Router,
    private pluginsService: PluginsService
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroyed()).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-versions');
    this.pluginsCompare = this.pluginsService.getCustomPlugins('extensions', 'yuv-versions-compare');
  }

  closeDetails() {
    this.location.back();
  }

  onEditRecentClick(id: string) {
    this.router.navigate(['/object', id]);
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.versions = [];
    }
  }

  onCompareVersionsChange(objects: DmsObject[]) {
    this.compare = {
      title: this.versionList.activeVersion.title,
      first: {
        label: this.translate.instant('yuv.client.state.versions.compare.label', { version: objects[0].version }),
        item: objects[0]
      },
      second: {
        label: this.translate.instant('yuv.client.state.versions.compare.label', { version: objects[1].version }),
        item: objects[1]
      }
    };
  }

  versionSelected(objects: DmsObject[]) {
    this.dmsObject = objects?.length === 1 ? objects[0] : null;
    this.compare =
      objects?.length > 1
        ? {
          title: this.versionList.activeVersion.title,
          second: {
            label: this.translate.instant('yuv.client.state.versions.compare.label', { version: objects[0].version }),
            item: objects[0]
          },
          first: {
            label: this.translate.instant('yuv.client.state.versions.compare.label', { version: objects[1].version }),
            item: objects[1]
          }
        }
        : null;
    this.selection = objects;
  }

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params: any) => {
      if (params.id) {
        this.dmsObjectID = params.id;
      }
    });
    // extract the versions from the route params
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const vp = params.get('version');
      this.versions = vp ? vp.split(',').map((v) => parseInt(v)) : [];
    });
  }

  ngOnDestroy() { }
}
