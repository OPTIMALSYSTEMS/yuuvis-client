import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IconRegistryService } from '@yuuvis/common-ui';
import {
  AppCacheService,
  BaseObjectTypeField,
  DmsObject,
  DmsService,
  PendingChangesService,
  Screen,
  ScreenService,
  SecondaryObjectTypeField,
  TranslateService
} from '@yuuvis/core';
import { ResponsiveDataTableOptions, ResponsiveTableData } from '@yuuvis/framework';
import { takeUntilDestroy } from 'take-until-destroy';
import { refresh, versions } from '../../../assets/default/svg/svg';

@Component({
  selector: 'yuv-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.versions';
  allItems: DmsObject[] = [];
  selection: string[] = [];
  dmsObjectID: string;
  dmsObject: DmsObject;
  dmsObject2: DmsObject;
  smallScreen: boolean;
  private options = {
    'yuv-responsive-master-slave': { useStateLayout: true },
    'yuv-version-result-panel': null,
    'yuv-object-details': null
  };

  tableData: ResponsiveTableData;
  tableOptions: ResponsiveDataTableOptions = {
    viewMode: 'horizontal',
    gridOptions: { getRowNodeId: o => this.getRowNodeId(o) }
  };

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    private appCacheService: AppCacheService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private dmsService: DmsService,
    private pendingChanges: PendingChangesService,
    private iconRegistry: IconRegistryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
    this.iconRegistry.registerIcons([refresh, versions]);
  }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.select([]);
    }
  }

  getOptions(component: string) {
    return this.options[component];
  }

  getVersion(o: any) {
    return o && typeof o === 'object' ? o[BaseObjectTypeField.VERSION_NUMBER] || o.data[BaseObjectTypeField.VERSION_NUMBER] : o;
  }

  getRowNodeId(o: any) {
    return o ? this.dmsObjectID + '_' + this.getVersion(o) : '';
  }

  select(items: any[]) {
    [this.dmsObject, this.dmsObject2] = items
      .slice(0, 2)
      .sort((a, b) => this.getVersion(a) - this.getVersion(b)) // lower version first
      .map(i => this.allItems.find(a => this.getVersion(a) === this.getVersion(i)));

    if (items.length > 2) {
      // reset selection
      this.selection = [this.getRowNodeId(this.dmsObject), this.getRowNodeId(this.dmsObject2)];
    }
  }

  refresh() {
    this.dmsService.getDmsObjectVersions(this.dmsObjectID).subscribe(rows => {
      this.allItems = rows;
      this.tableData = {
        columns: [{ field: SecondaryObjectTypeField.TITLE }],
        rows: rows.map(a => a.data).sort((a, b) => this.getVersion(b) - this.getVersion(a)),
        titleField: SecondaryObjectTypeField.TITLE,
        descriptionField: SecondaryObjectTypeField.DESCRIPTION,
        selectType: 'multiple'
      };
    });
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.result.title'));
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.dmsObjectID = params.id;
        this.refresh();
      }
    });
    // extract the versions from the route params
    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe(params => {
      this.selection = [params.get('version'), params.get('version2')].filter(v => v).map(v => this.getRowNodeId(v));
    });
  }

  ngOnDestroy() {}
}
