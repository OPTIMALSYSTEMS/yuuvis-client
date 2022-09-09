import { Component, OnDestroy } from '@angular/core';
import { LayoutService, LayoutSettings } from '@yuuvis/framework';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
  dashboardType;
  constructor(private layoutService: LayoutService) {
    this.layoutService.layoutSettings$.pipe(takeUntilDestroy(this)).subscribe({
      next: (s: LayoutSettings) => {
        this.dashboardType = s.dashboardType;
      }
    });
  }

  ngOnDestroy(): void {}
}
