import { Component, OnInit } from '@angular/core';
import { SearchQuery, SearchService } from '@yuuvis/core';
import { RecentItem } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-recent-activities',
  templateUrl: './test-recent-activities.component.html',
  styleUrls: ['./test-recent-activities.component.scss']
})
export class TestRecentActivitiesComponent implements OnInit {
  res: any;

  config = [
    {
      modified: true,
      created: true
    },
    {
      modified: false,
      created: true
    },
    {
      modified: true,
      created: false
    },
    {
      modified: false,
      created: true,
      classes: 'transparent flipped'
    },
    { modified: true, created: true, size: 5 }
  ];

  currentConfig;

  constructor(private search: SearchService) {}

  setConfig(cfg) {
    this.currentConfig = null;
    // wrap in timeout to force component to be initiated from scratch
    setTimeout(() => {
      this.currentConfig = cfg;
    }, 0);
  }

  onShowAll(q: SearchQuery) {
    this.res = q ? JSON.stringify(q, null, 2) : '';
    this.search.search(q).subscribe(res => console.log(res));
  }

  onRecentItemClicked(i: RecentItem) {
    console.log(i);
    this.res = i ? JSON.stringify(i, null, 2) : '';
  }

  ngOnInit() {}
}
