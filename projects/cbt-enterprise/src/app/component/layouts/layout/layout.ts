// import { Component, Inject, PLATFORM_ID } from '@angular/core';
// import { NavigationEnd, Router, RouterModule } from '@angular/router';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { filter } from 'rxjs';
// import { AuthService } from '../../../service/auth.service';

// interface MenuItem {
//   label: string;
//   icon: string;
//   route: string;
//   badge?: number;
//   isActive?: boolean;
// }

// @Component({
//   selector: 'cbt-layout',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './layout.html',
//   styleUrls: ['./layout.scss']
// })
// export class LayoutComponent {
//   role: 'ADMIN' | 'EXAMINER' | 'PROCTOR' = 'EXAMINER';
//   isSidebarCollapsed = false;
//   currentYear = new Date().getFullYear();

//   menus: { [key: string]: MenuItem[] } = {
//     ADMIN: [
//       { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
//       { label: 'User Management', icon: 'bi-people', route: '/admin/manage-user' },
//       { label: 'Test Management', icon: 'bi-journal-text', route: '/admin/tests' },
//       { label: 'System Configuration', icon: 'bi-gear', route: '/admin/configuration' },
//       { label: 'Analytics', icon: 'bi-graph-up', route: '/admin/analytics' },
//       { label: 'Reports', icon: 'bi-file-text', route: '/admin/reports' }
//     ],

//     EXAMINER: [
//       { label: 'Dashboard', icon: 'bi-speedometer2', route: '/examiner/dashboard' },
//       { label: 'Test Management', icon: 'bi-journal-text', route: '/examiner/tests' },
//       //{ label: 'Exam Sessions', icon: 'bi-laptop', route: '/proctor/sessions' },
//       { label: 'Enrollment', icon: 'bi-person-plus', route: '/examiner/enroll-candidate' },
//       { label: 'Grading', icon: 'bi-check-circle', route: '/examiner/grading' },
//       { label: 'Reports', icon: 'bi-file-text', route: '/examiner/test-results' },
//       { label: 'Notifications', icon: 'bi-bell', route: '/examiner/notifications', badge: 5 }
//     ],

//     PROCTOR: [
//       { label: 'Dashboard', icon: 'bi-speedometer2', route: '/proctor/dashboard' },
//       { label: 'Live Monitoring', icon: 'bi-camera-video', route: '/proctor/live-monitoring'},
//       { label: 'Exam Sessions', icon: 'bi-laptop', route: '/proctor/sessions' },
//       { label: 'Violation Alerts', icon: 'bi-exclamation-triangle', route: '/proctor/alerts' },
//       { label: 'Proctoring Reports', icon: 'bi-file-text', route: '/proctor/reports' },
//       { label: 'Settings', icon: 'bi-gear', route: '/proctor/settings' }
//     ]
//   };

//   currentMenu: MenuItem[] = [];

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     @Inject(PLATFORM_ID) private platformId: any
//   ) {
//     this.router.events.pipe(
//       filter(e => e instanceof NavigationEnd)
//     ).subscribe(() => {
//       this.determineUserRole();
//       this.updateActiveMenuItems();
//     });
//   }

//   ngOnInit(): void {
//     this.determineUserRole();
//     this.updateActiveMenuItems();
//   }

//   private determineUserRole(): void {
//     const url = this.router.url;
//     if (url.startsWith('/admin')) this.role = 'ADMIN';
//     else if (url.startsWith('/examiner')) this.role = 'EXAMINER';
//     else if (url.startsWith('/proctor')) this.role = 'PROCTOR';

//     this.currentMenu = this.menus[this.role];
//   }

//   private updateActiveMenuItems(): void {
//     const currentRoute = this.router.url;
//     this.currentMenu = this.currentMenu.map(item => ({
//       ...item,
//       isActive: currentRoute.startsWith(item.route)
//     }));
//   }

//   toggleSidebar(): void {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }

//   closeOffcanvas(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       const sidebar = document.getElementById('sidebar');
//       if (sidebar) {
//         // Use data-bs-dismiss to close the offcanvas
//         const closeButton = sidebar.querySelector('[data-bs-dismiss="offcanvas"]') as HTMLElement;
//         if (closeButton) {
//           closeButton.click();
//         }
//       }
//     }
//   }

//   onLogout(): void {
//     this.authService.logout()
//     console.log('Logging out...');
//     this.router.navigate(['auth/login']);
//   }

//   getUserDisplayName(): string {
//     const roleDisplay = {
//       'ADMIN': 'Administrator',
//       'EXAMINER': 'Examiner',
//       'PROCTOR': 'Proctor'
//     };
//     return roleDisplay[this.role];
//   }
// }











import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { IdanwoLogoComponent } from "../idanwo-logo/idanwo-logo.component";

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  isActive?: boolean;
}

@Component({
  selector: 'cbt-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IdanwoLogoComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  role: string | null = null;
  username: string | null = null;
  isSidebarCollapsed = false;
  currentYear = new Date().getFullYear();

  menus: { [key: string]: MenuItem[] } = {
    ROLE_ADMIN: [
      { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
      { label: 'User Management', icon: 'bi-people', route: '/admin/manage-user' },
      { label: 'Test Management', icon: 'bi-journal-text', route: '/admin/tests' },
      { label: 'System Configuration', icon: 'bi-gear', route: '/admin/configuration' },
      //{ label: 'Analytics', icon: 'bi-graph-up', route: '/admin/analytics' },
      { label: 'Reports', icon: 'bi-file-text', route: '/admin/reports' }
    ],

    ROLE_EXAMINER: [
      { label: 'Dashboard', icon: 'bi-speedometer2', route: '/examiner/dashboard' },
      { label: 'Test Management', icon: 'bi-journal-text', route: '/examiner/tests' },
      { label: 'Enrollment', icon: 'bi-person-plus', route: '/examiner/enroll-candidate' },
      { label: 'Grading', icon: 'bi-check-circle', route: '/examiner/grading' },
      { label: 'Reports', icon: 'bi-file-text', route: '/examiner/test-results' },
      { label: 'Notifications', icon: 'bi-bell', route: '/examiner/notifications', badge: 5 }
    ],

    ROLE_PROCTOR: [
      { label: 'Dashboard', icon: 'bi-speedometer2', route: '/proctor/dashboard' },
      { label: 'Live Monitoring', icon: 'bi-camera-video', route: '/proctor/live-monitoring'},
      { label: 'Exam Sessions', icon: 'bi-laptop', route: '/proctor/sessions' },
      { label: 'Violation Alerts', icon: 'bi-exclamation-triangle', route: '/proctor/alerts' },
      { label: 'Proctoring Reports', icon: 'bi-file-text', route: '/proctor/reports' },
      { label: 'Settings', icon: 'bi-gear', route: '/proctor/settings' }
    ]
  };

  currentMenu: MenuItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveMenuItems();
    });
  }

  ngOnInit(): void {
    // Get user info from AuthService
    this.authService.getUser$().subscribe(username => {
      this.username = username;
    });

    this.authService.getRole$().subscribe(role => {
      this.role = role;
      this.determineUserRole();
    });

    this.updateActiveMenuItems();
  }

  private determineUserRole(): void {
    if (!this.role) {
      this.currentMenu = [];
      return;
    }

    // Use the actual role from JWT
    this.currentMenu = this.menus[this.role] || [];
  }

  private updateActiveMenuItems(): void {
    const currentRoute = this.router.url;
    this.currentMenu = this.currentMenu.map(item => ({
      ...item,
      isActive: currentRoute.startsWith(item.route)
    }));
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeOffcanvas(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        const closeButton = sidebar.querySelector('[data-bs-dismiss="offcanvas"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['auth/login']);
      },
      error: () => {
        // Even if logout API fails, clear local storage and redirect
        this.router.navigate(['auth/login']);
      }
    });
  }

  getUserDisplayName(): string {
    // Show actual username if available, otherwise show role
    if (this.username) {
      return this.username;
    }
    
    const roleDisplay: { [key: string]: string } = {
      'ROLE_ADMIN': 'Administrator',
      'ROLE_EXAMINER': 'Examiner',
      'ROLE_PROCTOR': 'Proctor'
    };
    return roleDisplay[this.role || ''] || 'User';
  }

  getRoleDisplayName(): string {
    const roleDisplay: { [key: string]: string } = {
      'ROLE_ADMIN': 'Administrator',
      'ROLE_EXAMINER': 'Examiner', 
      'ROLE_PROCTOR': 'Proctor'
    };
    return roleDisplay[this.role || ''] || 'User';
  }
}