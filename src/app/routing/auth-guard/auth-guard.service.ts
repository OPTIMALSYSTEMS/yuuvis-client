import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@yuuvis/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.authenticated$.pipe(
      map((authenticated: boolean) => {
        if (!authenticated) {
          const uriParamQuery: NavigationExtras = { queryParams: { returnUrl: state.url } };
          this.router.navigate(['/enter'], uriParamQuery);
        }
        return authenticated;
      })
    );
  }
}
