import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResultStateService } from '../result.state.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'yuv-result-details',
  templateUrl: './result-details.component.html',
  styleUrls: ['./result-details.component.sass']
})
export class ResultDetailsComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  item;
  
  constructor(private resultStateService: ResultStateService, 
    private route: ActivatedRoute) { }

  ngOnInit() {
    
    this.subscriptions.push(this.resultStateService.selectedItem$.subscribe(item => {
      this.item = item;
    }))
    
    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      this.resultStateService.select(params.get('id'));
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
