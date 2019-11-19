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

  constructor(private search: SearchService) {}

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
