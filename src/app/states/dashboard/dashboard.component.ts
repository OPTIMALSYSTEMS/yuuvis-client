import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: {'class': 'themeBackground'}
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router) { }

  onQuickSearchQuery(statement: string) {
    this.router.navigate(['/result'], {queryParams: {query: statement}});
  }

  ngOnInit() {
  }

}
