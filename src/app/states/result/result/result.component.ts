import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScreenService, Screen } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { ResultStateService } from './result.state.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  screen: Screen;
  useSmallDeviceLayout: boolean;
  selectedItemId;
  private showDetails: boolean;

  items = [
    { id: '1', label: 'Eins' },
    { id: '2', label: 'Zwei' },
    { id: '3', label: 'Drei' },
    { id: '4', label: 'Vier' },
    { id: '5', label: 'Fünf' },
    { id: '6', label: 'Sechs' },
  ]

  constructor(private screenService: ScreenService,
    private router: Router,
    private route: ActivatedRoute,
    private resultStateService: ResultStateService) {

    this.subscriptions.push(this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.showDetails = e.urlAfterRedirects.indexOf('/details') !== -1;
      if(!this.showDetails) {
        // reset the selected item in the search state service
        this.resultStateService.select(null);
      }
    }));

    this.subscriptions.push(this.screenService.screenChange$.subscribe((screen: Screen) => {
      this.screen = screen;
      this.useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;
    }));
  }


  select(item) {
    const replaceUrl = this.router.url.indexOf('/details') !== -1;
    console.log(replaceUrl);
    this.router.navigate(['details', item.id], { relativeTo: this.route, replaceUrl: replaceUrl });
  }

  ngOnInit() {
    this.resultStateService.setResult(this.items);
    this.subscriptions.push(this.resultStateService.selectedItem$.subscribe(item => {
      this.selectedItemId = item ? item.id : null;
    }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
