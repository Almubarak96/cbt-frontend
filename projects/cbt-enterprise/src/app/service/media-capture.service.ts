// // Media Capture Service
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class MediaCaptureService {
//   private screenStream: MediaStream | null = null;
//   private cameraStream: MediaStream | null = null;
//   private audioStream: MediaStream | null = null;
  
//   private recordingStatus = new BehaviorSubject<{
//     screen: boolean;
//     camera: boolean; 
//     audio: boolean;
//   }>({ screen: false, camera: false, audio: false });

//   constructor() {}

//   async startScreenRecording(): Promise<boolean> {
//     try {
//       this.screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: { cursor: 'always' },
//         audio: true
//       });
      
//       this.updateRecordingStatus({ screen: true });
//       return true;
//     } catch (error) {
//       console.error('Screen recording failed:', error);
//       return false;
//     }
//   }

//   async startCameraRecording(): Promise<boolean> {
//     try {
//       this.cameraStream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//         audio: false
//       });
      
//       this.updateRecordingStatus({ camera: true });
//       return true;
//     } catch (error) {
//       console.error('Camera recording failed:', error);
//       return false;
//     }
//   }

//   async startAudioRecording(): Promise<boolean> {
//     try {
//       this.audioStream = await navigator.mediaDevices.getUserMedia({
//         video: false,
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100
//         }
//       });
      
//       this.updateRecordingStatus({ audio: true });
//       return true;
//     } catch (error) {
//       console.error('Audio recording failed:', error);
//       return false;
//     }
//   }

//   stopAllRecording() {
//     this.stopScreenRecording();
//     this.stopCameraRecording(); 
//     this.stopAudioRecording();
//   }

//   private stopScreenRecording() {
//     if (this.screenStream) {
//       this.screenStream.getTracks().forEach(track => track.stop());
//       this.screenStream = null;
//       this.updateRecordingStatus({ screen: false });
//     }
//   }

//   private stopCameraRecording() {
//     if (this.cameraStream) {
//       this.cameraStream.getTracks().forEach(track => track.stop());
//       this.cameraStream = null;
//       this.updateRecordingStatus({ camera: false });
//     }
//   }

//   private stopAudioRecording() {
//     if (this.audioStream) {
//       this.audioStream.getTracks().forEach(track => track.stop());
//       this.audioStream = null;
//       this.updateRecordingStatus({ audio: false });
//     }
//   }

//   private updateRecordingStatus(updates: Partial<{screen: boolean, camera: boolean, audio: boolean}>) {
//     const current = this.recordingStatus.value;
//     this.recordingStatus.next({ ...current, ...updates });
//   }

//   getRecordingStatus(): Observable<{screen: boolean, camera: boolean, audio: boolean}> {
//     return this.recordingStatus.asObservable();
//   }

//   captureScreenshot(): string {
//     // Implementation for capturing screenshots for violation evidence
//     const canvas = document.createElement('canvas');
//     const video = document.querySelector('video');
    
//     if (video) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx?.drawImage(video, 0, 0);
//       return canvas.toDataURL('image/jpeg');
//     }
    
//     return '';
//   }
// }