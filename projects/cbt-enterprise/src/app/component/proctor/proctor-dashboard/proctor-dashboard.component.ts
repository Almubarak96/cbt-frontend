import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

// Services


// Models
import { ProctoringSession, SessionStatus } from '../../../models/proctoring-session.model';
import { ViolationEvent, ViolationType, Severity } from '../../../models/violation-event.model';
//import { ProctoringService } from '../../../service/proctoring.service';
import { MessageService } from '../../../service/message.service';

@Component({
  selector: 'app-proctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proctor-dashboard.component.html',
  styleUrls: ['./proctor-dashboard.component.scss']
})
export class ProctorDashboardComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
  }
  ngOnInit(): void {
  }

}