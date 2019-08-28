import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SearchQuery } from '@yuuvis/core';
import { APP_VARS } from '../../app.vars';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground' }
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private titleService: Title) {}

  onQuickSearchQuery(query: SearchQuery) {
    this.router.navigate(['/result'], {
      queryParams: { query: JSON.stringify(query.toQueryJson()) }
    });
  }

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
  }
}
