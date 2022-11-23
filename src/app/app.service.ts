import { Injectable } from '@angular/core';
import { AppCacheService } from '@yuuvis/framework';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DashboardConfig } from './app.interface';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private STORAGE_KEY = 'yuv.client.dashboard.config';

  private cfg: DashboardConfig;
  private dashboardConfigSource = new ReplaySubject<DashboardConfig>();
  public dashboardConfig$: Observable<DashboardConfig> = this.dashboardConfigSource.asObservable();

  constructor(private appCacheService: AppCacheService) {
    this.appCacheService
      .getItem(this.STORAGE_KEY)
      .pipe(
        tap((res) => {
          this.cfg = res || {
            dashboardType: 'default'
          };
          this.dashboardConfigSource.next(this.cfg);
        })
      )
      .subscribe();
  }

  getDashboardConfig(): DashboardConfig {
    return (
      this.cfg || {
        dashboardType: 'default'
      }
    );
  }

  setDashboardConfig(cfg: Partial<DashboardConfig>): void {
    const updatedCfg: DashboardConfig = { ...this.cfg, ...cfg };
    this.appCacheService
      .setItem(this.STORAGE_KEY, updatedCfg)
      .pipe(
        tap(() => {
          this.cfg = updatedCfg;
          this.dashboardConfigSource.next(this.cfg);
        })
      )
      .subscribe();
  }
}
