import { Component, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { interval, Subscription } from 'rxjs';
import { ProctoringSession } from '../../../models/proctoring-session.model';
import { ViolationType } from '../../../models/violation-event.model';

// Use dynamic imports to avoid build-time errors
declare const cocossd: any;
declare const tf: any;



interface StatusItem {
  name: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  icon: string;
  description: string;
  lastUpdate?: Date;
}

@Component({
  selector: 'webcam-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webcam-capture.component.html',
  styleUrls: ['./webcam-capture.component.scss']
})
export class WebcamCaptureComponent  {









  
}