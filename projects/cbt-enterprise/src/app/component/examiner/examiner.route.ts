import { Routes } from '@angular/router';
import { CreateTest } from './create-test/create-test';
import { TestList } from './test-list/test-list';
import { QuestionList } from './question-list/question-list';
import { CreateQuestion } from './create-question/create-question';
import { ExaminerDashboardComponent } from './examiner-dashboard/examiner-dashboard.component';
import { EnrollCandidateComponent } from './enroll-candidate/enroll-candidate.component';
import { TestInstructionsFormComponent } from './create-test-instructions/test-instructions-form';
import { AnalyticsComponent } from './test-analytics/test-analytics.component';
import { ManualGradingComponent } from './manual-grading/manual-grading.component';
import { TestResultsListComponent } from './test-results-list/test-results-list.component';
import { StudentResultsComponent } from './student-results/student-results.component';



export const EXAMINER_ROUTES: Routes = [
    {
        path: '',
        component: ExaminerDashboardComponent,
    },

    {
        path: 'dashboard',
        component: ExaminerDashboardComponent,
    },

    {
        path: 'tests/new',
        component: CreateTest,
    },
    {
        path: 'tests',
        component: TestList
    },

    {
        path: 'test-results',
        component: TestResultsListComponent
    },
    {
        path: 'results/:testId/students',
        component: StudentResultsComponent
    },
    {
        path: 'tests/:testId/edit',
        component: CreateTest
    },

    {
        path: 'tests/:id/instructions',
        component: TestInstructionsFormComponent
    },

    {
        path: 'tests/:id/enroll',
        component: EnrollCandidateComponent
    },

    {
        path: 'tests/:id/grading',
        component: ManualGradingComponent
    },

    {
        path: 'tests/:id/analytics',
        component: AnalyticsComponent
    },



    {
        path: 'results/:testId',
        children: [
            {
                path: 'students',
                component: StudentResultsComponent
            },
            {
                path: 'essay-grading',
                component: ManualGradingComponent
            }
        ]
    },


    {
        path: 'tests/:testId/questions',
        children: [
            { path: '', component: QuestionList },
            { path: 'new', component: CreateQuestion },
            { path: ':questionId/edit', component: CreateQuestion }
        ]
    },
    /* 
        {
            path: '',
    
            children: [
                { path: 'enroll-candidate', component: EnrollCandidateComponent }
            ]
        } */



];