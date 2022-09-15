import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroy } from 'take-until-destroy';

import { DashboardConfig } from '../../app.interface';
import { AppService } from '../../app.service';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardConfig: DashboardConfig;
  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.dashboardConfig$.pipe(takeUntilDestroy(this)).subscribe({
      next: (res) => {
        this.dashboardConfig = res;
      }
    });
  }

  ngOnDestroy(): void {}
}
