import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ScreenService, Screen, SearchService, DmsService, DmsObject } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { SearchResult } from 'projects/yuuvis/core/src/lib/service/search/search.service.interface';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  showMaster: boolean;
  showSlave: boolean;
  useSmallDeviceLayout: boolean;

  searchResult: SearchResult;
  selectedItems: DmsObject[] = [];

  constructor(private screenService: ScreenService,
    private dmsService: DmsService,
    private searchService: SearchService,
    private location: PlatformLocation,
    private route: ActivatedRoute) {


    this.subscriptions.push(this.screenService.screenChange$.subscribe((screen: Screen) => {
      
      const useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;

      // if we switch from large to small layout
      if(!this.useSmallDeviceLayout && useSmallDeviceLayout && this.selectedItems.length){
        this.location.pushState({}, '', '');
      }
            
      this.useSmallDeviceLayout = useSmallDeviceLayout;
      this.setPanelVisibility();

      if (this.useSmallDeviceLayout) {
        this.location.onPopState((x) => {
          if (this.selectedItems.length) {
            this.select(null);
          }
        });
      }
    }));
  }

  private setPanelVisibility() {
    if (!this.useSmallDeviceLayout) {
      // large screen mode
      this.showSlave = true;
      this.showMaster = true;
    } else if (this.selectedItems.length) {
      // small screen mode with selected item
      this.showMaster = false;
      this.showSlave = true;
    } else {
      this.showMaster = true;
      this.showSlave = false;
    }
  }

  closeDetails() {
    this.location.back();
  }

  select(items: string[]) {
    if (this.useSmallDeviceLayout) {
      if (this.selectedItems && items) {
        this.location.replaceState({}, '', '');
      } else if (!this.selectedItems && items) {
        this.location.pushState({}, '', '');
      }
    }

    this.dmsService.getDmsObjects(items).subscribe((dmsObjects: DmsObject[]) => {
      this.selectedItems = dmsObjects;
    });


    // this.selectedItems = items;
    this.setPanelVisibility();
  }

  executeQuery(query: string) {
    this.searchService.search(query).subscribe((res: SearchResult) => {
      this.searchResult = res;
    })
  }

  ngOnInit() {

    // extract the query from the route params
    this.subscriptions.push(this.route.queryParamMap.subscribe(params => {
      this.executeQuery(params.get('query'));
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
