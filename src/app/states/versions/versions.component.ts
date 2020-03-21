import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'yuv-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.versions';
  allItems: DmsObject[] = [];
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
    gridOptions: { getRowNodeId: o => o.id + '_' + o[BaseObjectTypeField.VERSION_NUMBER] }
  };

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    private appCacheService: AppCacheService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private dmsService: DmsService,
    private pendingChanges: PendingChangesService,
    private route: ActivatedRoute,
    private router: Router
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
      this.select([]);
    }
  }

  getOptions(component: string) {
    return this.options[component];
  }

  select(items: any[]) {
    [this.dmsObject, this.dmsObject2] = items.map(i =>
      this.allItems.find(a => a.data[BaseObjectTypeField.VERSION_NUMBER] === i[BaseObjectTypeField.VERSION_NUMBER])
    );
  }

  refresh() {
    // load versions
    this.dmsService.getDmsObjectVersions(this.dmsObjectID).subscribe(rows => {
      this.allItems = rows;
      this.tableData = {
        columns: [{ field: SecondaryObjectTypeField.TITLE }],
        rows: rows.map(a => a.data).sort((a, b) => b[BaseObjectTypeField.VERSION_NUMBER] - a[BaseObjectTypeField.VERSION_NUMBER]),
        titleField: SecondaryObjectTypeField.TITLE,
        descriptionField: SecondaryObjectTypeField.DESCRIPTION,
        // titleField: SecondaryObjectTypeField.TITLE.replace('appClient:', ''),
        // descriptionField: SecondaryObjectTypeField.DESCRIPTION.replace('appClient:', ''),
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
      const version = params.get('version');
      const version2 = params.get('version2');
    });
  }

  ngOnDestroy() {}
}
