import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../service/token.storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private store: TokenStorageService, private router: Router) {}

  canActivate(): boolean {
    const token = this.store.accessToken;
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 < payload.exp) return true;
    } catch {}
    this.router.navigate(['/login']);
    return false;
  }
}
