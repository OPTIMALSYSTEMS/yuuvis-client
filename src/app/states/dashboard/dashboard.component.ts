import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SearchQuery } from '@yuuvis/core';
import { APP_VARS } from '../../app.vars';
import { AppSearchService } from '../../service/app-search.service';
@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground' }
})
export class DashboardComponent implements OnInit {
  // application wide search query
  appQuery: SearchQuery;

  constructor(private router: Router, private appSearch: AppSearchService, private titleService: Title) {
    this.appSearch.query$.subscribe((q: SearchQuery) => {
      this.appQuery = q;
    });
  }

  onQuickSearchQuery(query: SearchQuery) {
    this.appSearch.setQuery(query);
    this.router.navigate(['/result'], {
      queryParams: { query: JSON.stringify(query.toQueryJson()) }
    });
  }

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
  }
}
