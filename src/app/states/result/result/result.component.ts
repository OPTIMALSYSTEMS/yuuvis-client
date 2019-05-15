import { Component, OnDestroy } from '@angular/core';
import { ScreenService, Screen } from '@yuuvis/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];
  selected;
  screen: Screen;

  constructor(private screenService: ScreenService) {
    this.screenService.screenChange$.subscribe((screen: Screen) => this.screen = screen)
  }


  select(x) {
    this.selected = x;
  }


  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
