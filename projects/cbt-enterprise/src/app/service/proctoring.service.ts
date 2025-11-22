import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import type { BlazeFaceModel } from '@tensorflow-models/blazeface';
import { BehaviorSubject, interval } from 'rxjs';

export interface FacePrediction {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks: [number, number][];
  probability: number[];
}

@Injectable({ providedIn: 'root' })
export class ProctoringService {
  private mediaStream?: MediaStream;
  private faceModel: BlazeFaceModel | null = null;
  private readonly FACE_CONFIDENCE = 0.8;

  public facePresent$ = new BehaviorSubject<boolean>(false);
  public predictions$ = new BehaviorSubject<FacePrediction[]>([]);
  public cameraActive$ = new BehaviorSubject<boolean>(false);

  private detectionInterval: any;
  private uploadTimerId: any;
  private readonly SNAPSHOT_INTERVAL_MS = 20000;

  async initCamera(videoEl: HTMLVideoElement): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoEl.srcObject = this.mediaStream;
    await videoEl.play();
    this.cameraActive$.next(true);
    await this.initModel();
    this.startDetection(videoEl);
  }

  private async initModel(): Promise<void> {
    if (!this.faceModel) {
      await tf.setBackend('wasm');
      await tf.ready();
      this.faceModel = await blazeface.load();
    }
  }

  private startDetection(videoEl: HTMLVideoElement): void {
    if (!this.faceModel) return;
    this.detectionInterval = interval(1000).subscribe(async () => {
      const predictions = await this.faceModel!.estimateFaces(videoEl, false);
      const mapped: FacePrediction[] = (predictions || []).map((p: any) => ({
        topLeft: [p.topLeft[0], p.topLeft[1]] as [number, number],
        bottomRight: [p.bottomRight[0], p.bottomRight[1]] as [number, number],
        landmarks: p.landmarks as [number, number][],
        probability: Array.isArray(p.probability)
          ? p.probability
          : [p.probability as number],
      }));
      this.predictions$.next(mapped);
      const detected =
        mapped.some(m => m.probability[0] >= this.FACE_CONFIDENCE) || false;
      this.facePresent$.next(detected);
    });
  }

  monitorTabFocus(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) alert('Warning: Tab switch detected.');
    });
  }

  disableUserShortcuts(): void {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F12') e.preventDefault();
    });
  }

  private async captureSnapshot(videoEl: HTMLVideoElement, quality = 0.7): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', quality));
  }

  public startSnapshotUploads(videoEl: HTMLVideoElement): void {
    if (this.uploadTimerId) return;
    this.uploadTimerId = setInterval(() => {
      this.captureAndUploadSnapshot(videoEl).catch(err =>
        console.warn('Snapshot upload failed', err)
      );
    }, this.SNAPSHOT_INTERVAL_MS);
  }

  private async captureAndUploadSnapshot(videoEl: HTMLVideoElement): Promise<void> {
    const blob = await this.captureSnapshot(videoEl);
    const fd = new FormData();
    fd.append('file', blob, 'snapshot.jpg');
    fd.append('timestamp', new Date().toISOString());
    fd.append('faceDetected', String(this.facePresent$.value));
    await fetch('/api/proctor/upload', { method: 'POST', body: fd });
  }

  public stopSnapshotUploads(): void {
    if (this.uploadTimerId) {
      clearInterval(this.uploadTimerId);
      this.uploadTimerId = null;
    }
  }

  public cleanup(): void {
    this.stopSnapshotUploads();
    this.detectionInterval?.unsubscribe();
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.cameraActive$.next(false);
  }
}
