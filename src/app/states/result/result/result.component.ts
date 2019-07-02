import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DmsService,
  ScreenService,
  SearchQuery,
  SearchService
} from '@yuuvis/core';
import { SearchResult } from 'projects/yuuvis/core/src/lib/service/search/search.service.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // showMaster: boolean;
  // showSlave: boolean;
  // useSmallDeviceLayout: boolean;

  searchResult: SearchResult;
  selectedItems: string[] = [];

  constructor(
    private screenService: ScreenService,
    private dmsService: DmsService,
    private router: Router,
    private searchService: SearchService,
    private location: PlatformLocation,
    private route: ActivatedRoute
  ) {
    // this.subscriptions.push(
    //   this.screenService.screenChange$.subscribe((screen: Screen) => {
    //     const useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;
    //     // if we switch from large to small layout
    //     if (
    //       !this.useSmallDeviceLayout &&
    //       useSmallDeviceLayout &&
    //       this.selectedItems.length
    //     ) {
    //       this.location.pushState({}, '', '');
    //     }
    //     this.useSmallDeviceLayout = useSmallDeviceLayout;
    //     this.setPanelVisibility();
    //     if (this.useSmallDeviceLayout) {
    //       this.location.onPopState(x => {
    //         if (this.selectedItems.length) {
    //           this.select(null);
    //         }
    //       });
    //     }
    //   })
    // );
  }

  // private setPanelVisibility() {
  //   if (!this.useSmallDeviceLayout) {
  //     // large screen mode
  //     this.showSlave = true;
  //     this.showMaster = true;
  //   } else if (this.selectedItems.length) {
  //     // small screen mode with selected item
  //     this.showMaster = false;
  //     this.showSlave = true;
  //   } else {
  //     this.showMaster = true;
  //     this.showSlave = false;
  //   }
  // }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    this.selectedItems = [];
  }

  select(items: string[]) {
    this.selectedItems = items;

    // this.router.navigate([items[0]], {
    //   relativeTo: this.route,
    //   replaceUrl: true,
    //   preserveQueryParams: true
    // });
  }

  // selectDetails(item: string) {
  //   if (this.useSmallDeviceLayout) {

  //   }

  //   this.dmsService
  //     .getDmsObjects(items)
  //     .subscribe((dmsObjects: DmsObject[]) => {
  //       this.selectedItems = dmsObjects;
  //     });

  //   // this.selectedItems = items;
  //   this.setPanelVisibility();
  // }

  executeQuery(query: string) {
    this.searchService
      .searchByQuery(new SearchQuery(JSON.parse(query)))
      .subscribe((res: SearchResult) => {
        this.searchResult = res;
      });
  }

  ngOnInit() {
    // extract the query from the route params
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(params => {
        this.executeQuery(params.get('query'));
      })
    );
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        console.log('got some params', params);
      })
    );

    // this.subscriptions.push(
    //   this.router.events
    //     // .pipe(filter(e => e instanceof ChildActivationEnd))
    //     .subscribe(e => {
    //       console.log(e);
    //     })
    // );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
