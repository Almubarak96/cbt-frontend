import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FacePrediction, ProctoringService } from '../../../service/proctoring.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proctoring-widget',
  templateUrl: './proctoring-widget.component.html',
  styleUrls: ['./proctoring-widget.component.scss'],
  imports: [CommonModule]
})
export class ProctoringWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay') overlayRef!: ElementRef<HTMLCanvasElement>;

  cameraActive = false;
  faceDetected = false;
  loadingModel = true;

  private subCamera?: Subscription;
  private subFace?: Subscription;
  private subPred?: Subscription;

  constructor(private proctor: ProctoringService) {}

  ngOnInit(): void {
    this.proctor.monitorTabFocus();
    this.proctor.disableUserShortcuts();
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.proctor.initCamera(this.videoRef.nativeElement);
      this.subCamera = this.proctor.cameraActive$.subscribe(
        v => (this.cameraActive = v)
      );
      this.subFace = this.proctor.facePresent$.subscribe(
        v => (this.faceDetected = v)
      );
      this.subPred = this.proctor.predictions$.subscribe(preds =>
        this.drawPredictions(preds)
      );
      this.proctor.startSnapshotUploads(this.videoRef.nativeElement);
      this.loadingModel = false;
    } catch (err) {
      console.error('Camera initialization failed', err);
    }
  }

  private drawPredictions(predictions: FacePrediction[]): void {
    const canvas = this.overlayRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const video = this.videoRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    predictions.forEach(p => {
      const [x1, y1] = p.topLeft;
      const [x2, y2] = p.bottomRight;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    });
  }

  ngOnDestroy(): void {
    this.proctor.cleanup();
    this.subCamera?.unsubscribe();
    this.subFace?.unsubscribe();
    this.subPred?.unsubscribe();
  }
}
