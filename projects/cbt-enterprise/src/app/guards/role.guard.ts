import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TokenStorageService } from '../service/token.storage.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private store: TokenStorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    const token = this.store.accessToken;
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role as string | undefined;
      if (!expectedRoles || (role && expectedRoles.includes(role))) return true;
    } catch {}
    this.router.navigate(['/forbidden']);
    return false;
  }
}
