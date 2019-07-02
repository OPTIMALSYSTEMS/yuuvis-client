import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yuv-result-details',
  templateUrl: './result-details.component.html',
  styleUrls: ['./result-details.component.sass']
})
export class ResultDetailsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  selectedItem: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.paramMap.subscribe((params: any) => {
        console.log('DETAILS', params);
        this.selectedItem = params.get('id');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
