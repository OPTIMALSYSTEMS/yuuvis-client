import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginComponent } from './plugin.component';
import { PluginStateConfig } from './plugins.interface';
import { PluginsService } from './plugins.service';

@Injectable({
  providedIn: 'root'
})
export class PluginGuard  {
  static updateRouter(router: Router, states: any[]) {
    (states || []).forEach((state: any) => {
      router.config.unshift({ path: state.path, component: PluginComponent, canActivate: [PluginGuard], canDeactivate: [PluginGuard] });
      // router.resetConfig(router.config);
    });
  }

  constructor(private pluginsService: PluginsService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.pluginsService
      .getCustomPlugins('states', '', state.url.replace('/', ''))
      .pipe(map(([config]) => (config?.canActivate ? this.pluginsService.applyFunction(config.canActivate, 'route, state', arguments) : true)));
  }

  canDeactivate(
    component: PluginComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return (component?.config as PluginStateConfig)?.canDeactivate
      ? this.pluginsService.applyFunction((component.config as PluginStateConfig).canDeactivate, 'component, currentRoute, currentState, nextState', arguments)
      : true;
  }
}
