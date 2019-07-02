import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  NavigationExtras,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.authenticated$.pipe(
      map((authenticated: boolean) => {
        if (!authenticated) {
          const uriParamQuery: NavigationExtras = {
            queryParams: { returnUrl: state.url }
          };
          this.router.navigate(['/enter'], uriParamQuery);
        }
        return authenticated;
      })
    );
  }
}
