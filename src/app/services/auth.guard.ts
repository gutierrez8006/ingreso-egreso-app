import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private authService: AuthService, private router: Router) {

  }

  canLoad(): Observable<boolean> { // lanza una suscripcion cada vez que se invoca
    return this.authService.isAuth()
      .pipe(
        tap(estado => {
          if (!estado) {
            this.router.navigate(['/login']);
          }
        }),
        take(1) // cancela la suscripcion cuando se resuelve la primera vez
      );
  }

  canActivate(): Observable<boolean> {
    return this.authService.isAuth()
      .pipe(
        tap(estado => {
          if (!estado) {
            this.router.navigate(['/login']);
          }
        })
      );
  }
}
