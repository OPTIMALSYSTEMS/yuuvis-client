import { Component, OnInit } from '@angular/core';
import { SearchQuery, SearchService } from '@yuuvis/core';
import { RecentActivitiesData, RecentItem } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-recent-activities',
  templateUrl: './test-recent-activities.component.html',
  styleUrls: ['./test-recent-activities.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestRecentActivitiesComponent implements OnInit {
  res: any;

  dataEmpty: RecentActivitiesData = {
    created: [],
    modified: []
  };
  dataEmptyCreated: RecentActivitiesData = {
    created: [],
    modified: this.generateRecentItems()
  };

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
    { modified: true, created: true, size: 5 },
    { data: this.dataEmpty },
    { data: this.dataEmptyCreated }
  ];

  currentConfig;

  constructor(private search: SearchService) {}

  private generateRecentItems(amount: number = 5): RecentItem[] {
    const items = [];
    for (let i = 1; i <= amount; i++) {
      items.push({
        title: `Recent item #${i}`,
        description: `Description no. ${i}`,
        objectId: `4711${i}`,
        objectTypeId: `ot${i}`,
        objectTypeIcon:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        objectTypeLabel: `Object type #${i}`,
        date: new Date(2012, 0, i)
      });
    }
    return items;
  }

  setConfig(cfg) {
    this.currentConfig = null;
    // wrap in timeout to force component to be initiated from scratch
    setTimeout(() => {
      this.currentConfig = cfg;
    }, 0);
  }

  onShowAll(q: SearchQuery) {
    this.res = q ? JSON.stringify(q, null, 2) : '';
    this.search.search(q).subscribe((res) => console.log(res));
  }

  onRecentItemClicked(i: RecentItem) {
    console.log(i);
    this.res = i ? JSON.stringify(i, null, 2) : '';
  }

  ngOnInit() {}
}
