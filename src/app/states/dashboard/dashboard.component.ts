import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchQuery } from '@yuuvis/core';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground' }
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) {}

  onQuickSearchQuery(query: SearchQuery) {
    const param = JSON.stringify(query.toJson());

    this.router.navigate(['/result'], {
      queryParams: { query: JSON.stringify(query.toJson()) }
    });
  }

  ngOnInit() {}
}
