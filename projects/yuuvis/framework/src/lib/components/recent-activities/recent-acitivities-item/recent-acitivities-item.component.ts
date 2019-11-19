import { Component, Input, OnInit } from '@angular/core';
import { RecentItem } from '../recent-activities.component';

@Component({
  selector: 'yuv-recent-acitivities-item',
  templateUrl: './recent-acitivities-item.component.html',
  styleUrls: ['./recent-acitivities-item.component.scss']
})
export class RecentAcitivitiesItemComponent implements OnInit {
  @Input() recentItem: RecentItem;

  constructor() {}

  ngOnInit() {}
}
