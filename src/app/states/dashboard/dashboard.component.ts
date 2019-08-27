import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, SearchQuery } from '@yuuvis/core';
import { formModel } from './formmodel.tmp';
@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground' }
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private backend: BackendService) {}

  formOptions = {
    formModel: formModel,
    data: {}
  };

  onQuickSearchQuery(query: SearchQuery) {
    this.router.navigate(['/result'], {
      queryParams: { query: JSON.stringify(query.toQueryJson()) }
    });
  }

  ngOnInit() {}
}
