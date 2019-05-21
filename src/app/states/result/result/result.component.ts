import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ScreenService, Screen } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PlatformLocation } from '@angular/common';

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

  searchResultItems;
  selectedItem;

  constructor(private screenService: ScreenService,
    private location: PlatformLocation,
    private route: ActivatedRoute) {


    this.subscriptions.push(this.screenService.screenChange$.subscribe((screen: Screen) => {
      
      const useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;

      // if we switch from large to small layout
      if(!this.useSmallDeviceLayout && useSmallDeviceLayout && this.selectedItem){
        this.location.pushState({}, '', '');
      }
            
      this.useSmallDeviceLayout = useSmallDeviceLayout;
      this.setPanelVisibility();

      if (this.useSmallDeviceLayout) {
        this.location.onPopState((x) => {
          if (this.selectedItem) {
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
    } else if (this.selectedItem) {
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

  select(item) {
    if (this.useSmallDeviceLayout) {
      if (this.selectedItem && item) {
        this.location.replaceState({}, '', '');
      } else if (!this.selectedItem && item) {
        this.location.pushState({}, '', '');
      }
    }
    this.selectedItem = item;
    this.setPanelVisibility();
  }

  executeQuery(query: string) {

    this.searchResultItems = [
      { id: '1', label: 'Eins' },
      { id: '2', label: 'Zwei' },
      { id: '3', label: 'Drei' },
      { id: '4', label: 'Vier' },
      { id: '5', label: 'Fünf' },
      { id: '6', label: 'Sechs' },
    ];
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
