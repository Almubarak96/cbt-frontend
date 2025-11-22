import { Routes } from '@angular/router';
import { AppConfig } from './app-config/app-config';
import { TestList } from '../examiner/test-list/test-list';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { ExaminerDashboardComponent } from '../examiner/examiner-dashboard/examiner-dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: ExaminerDashboardComponent
    },

    {
        path: 'dashboard',
        component: ExaminerDashboardComponent
    },

    {
        path: 'configuration',
        component: AppConfig
    },

    {
        path: 'manage-user',
        component: RegisterUserComponent
    },
    {
        path: 'tests',
        component: TestList
    },
];