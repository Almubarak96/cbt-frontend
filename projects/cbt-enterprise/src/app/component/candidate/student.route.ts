import { Routes } from '@angular/router';
import { TestSession } from './test-session/test-session';
import { TestSelectionComponent } from './test-selection/test-selection.component';
import { ResultsPollingComponent } from './results-polling/results-polling.component';
import { ExamResultsComponent } from './test-result/test-result.component';


export const STUDENT_ROUTES: Routes = [
  {
    path: 'test-selection',
    component: TestSelectionComponent
  },

 { path: 'test-session/:testId', component: TestSession },
   { 
    path: 'results-polling/:sessionId', 
    component: ResultsPollingComponent 
  },
  { 
    path: 'exam-results/:sessionId', 
    component: ExamResultsComponent 
  }

];