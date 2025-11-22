import { Routes } from "@angular/router";
import { WebcamLogsComponent } from "./webcam-logs/webcam-logs.component";
import { MonitorTestComponent } from "./monitor-test/monitor-test.component";
import { AttendanceComponent } from "./attendance/attendance.component";
import { ProctorDashboardComponent } from "./proctor-dashboard/proctor-dashboard.component";
import { ProctoringReportsComponent } from "./proctoring-reports/proctoring-reports.component";

export const PROCTOR_ROUTES: Routes = [

    {
        path: '',
        component: ProctorDashboardComponent,
    },

    {
        path: 'dashboard',
        component: ProctorDashboardComponent,
    },

      {
        path: 'live-monitoring',
        component: MonitorTestComponent
    },

    { path: 'reports', component: ProctoringReportsComponent },

    {
        path: 'logs',
        component: WebcamLogsComponent,
    },

  

    {
        path: 'attendance',
        component: AttendanceComponent,
    },
]