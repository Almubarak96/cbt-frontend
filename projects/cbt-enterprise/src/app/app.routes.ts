import { Routes } from '@angular/router';

import { LayoutComponent } from './component/layouts/layout/layout';
import { LandingPageComponent } from './component/layouts/landing-page/landing-page.component';
import { TestSession } from './component/candidate/test-session/test-session';


export const routes: Routes = [

  {
    path: '',
    component: LandingPageComponent
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./component/auth/auth.route')
        .then(m => m.AUTHENTICATION_ROUTES)
  },

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./component/admin/admin.route')
            .then(m => m.ADMIN_ROUTES)
      },

      {
        path: 'examiner',
        loadChildren: () =>
          import('./component/examiner/examiner.route')
            .then(m => m.EXAMINER_ROUTES)
      },

      {
        path: 'proctor',
        loadChildren: () =>
          import('./component/proctor/proctor.route')
            .then(m => m.PROCTOR_ROUTES)
      },

    ]
  },

  {
    path: 'student',
    loadChildren: () =>
      import('./component/candidate/student.route')
        .then(m => m.STUDENT_ROUTES)
  }, 
/*   {
    path: 'student/test-session',
    component: TestSession
  } */



];
