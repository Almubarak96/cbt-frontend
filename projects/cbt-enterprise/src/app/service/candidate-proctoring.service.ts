// candidate-proctoring.service.ts
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ProctoringConfig {
  enableWebcam: boolean;
  enableScreenRecording: boolean;
  enableMicrophone: boolean;
  enableFaceDetection: boolean;
  enableVoiceDetection: boolean;
  enableTabMonitoring: boolean;
  enableFullscreenMonitoring: boolean;
  enableCopyPasteMonitoring: boolean;
}

export interface ProctoringStatus {
  isActive: boolean;
  webcamActive: boolean;
  screenSharing: boolean;
  microphoneActive: boolean;
  connectionQuality: number;
  violationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateProctoringService implements OnDestroy {
  private socket!: WebSocketSubject<any>;
  private sessionId!: string;
  private isProctoringActive = false;

  private mediaStreams: {
    webcam?: MediaStream;
    screen?: MediaStream;
    audio?: MediaStream;
  } = {};

  private statusSubject = new BehaviorSubject<ProctoringStatus>({
    isActive: false,
    webcamActive: false,
    screenSharing: false,
    microphoneActive: false,
    connectionQuality: 100,
    violationsCount: 0
  });

  private heartbeatInterval: any;
  private monitoringIntervals: any[] = [];
  private violationCount = 0;

  constructor(private ngZone: NgZone) {}

  get status$(): Observable<ProctoringStatus> {
    return this.statusSubject.asObservable();
  }

  async initializeProctoring(sessionId: string, config: ProctoringConfig): Promise<void> {
    if (this.isProctoringActive) {
      console.warn('Proctoring already active');
      return;
    }

    this.sessionId = sessionId;
    this.isProctoringActive = true;
    this.violationCount = 0;

    try {
      // Connect to WebSocket first
      await this.connectWebSocket();

      // Request permissions and start monitoring
      await this.startMediaMonitoring(config);

      // Start behavioral monitoring
      this.startBehavioralMonitoring(config);

      this.updateStatus({
        isActive: true,
        connectionQuality: 100
      });

    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
      this.stopProctoring();
      throw error;
    }
  }

  stopProctoring(): void {
    this.isProctoringActive = false;
    
    // Clear all intervals
    this.clearAllIntervals();
    
    // Stop media streams
    this.stopAllMediaStreams();
    
    // Close WebSocket
    this.closeWebSocket();

    this.updateStatus({
      isActive: false,
      webcamActive: false,
      screenSharing: false,
      microphoneActive: false,
      connectionQuality: 0,
      violationsCount: this.violationCount
    });
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = webSocket({
          url: `ws://localhost:8080/api/ws-proctoring/${this.sessionId}`,
          openObserver: {
            next: () => {
              console.log('WebSocket connected');
              resolve();
            }
          }
        });

        this.socket.subscribe({
          next: (message) => this.handleProctorMessage(message),
          error: (err) => {
            console.error('Proctoring WebSocket error:', err);
            this.reportViolation('WEBSOCKET_ERROR', 'HIGH', 'Connection to proctoring server lost');
            reject(err);
          },
          complete: () => {
            console.log('WebSocket connection closed');
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async startMediaMonitoring(config: ProctoringConfig): Promise<void> {
    const mediaPromises: Promise<void>[] = [];

    if (config.enableWebcam) {
      mediaPromises.push(this.startWebcamMonitoring());
    }
    if (config.enableScreenRecording) {
      mediaPromises.push(this.startScreenMonitoring());
    }
    if (config.enableMicrophone) {
      mediaPromises.push(this.startAudioMonitoring());
    }

    await Promise.allSettled(mediaPromises);
  }

  private startBehavioralMonitoring(config: ProctoringConfig): void {
    this.startHeartbeat();

    if (config.enableTabMonitoring) {
      this.startTabMonitoring();
    }
    if (config.enableFullscreenMonitoring) {
      this.startFullscreenMonitoring();
    }
    if (config.enableCopyPasteMonitoring) {
      this.startCopyPasteMonitoring();
    }
  }

  private async startWebcamMonitoring(): Promise<void> {
    try {
      this.mediaStreams.webcam = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15, max: 30 }
        }
      });

      this.sendMediaStatus('webcam', 'ACTIVE');
      this.updateStatus({ webcamActive: true });

      if ((window as any).faceapi) {
        this.startFaceDetection();
      }

    } catch (error) {
      console.error('Webcam access denied:', error);
      this.reportViolation('CAMERA_BLOCKED', 'HIGH', 'Camera access blocked or unavailable');
      this.updateStatus({ webcamActive: false });
    }
  }

  private async startScreenMonitoring(): Promise<void> {
    try {
      // Use proper typing for getDisplayMedia
      const mediaDevices = navigator.mediaDevices as any;
      this.mediaStreams.screen = await mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });

      this.sendMediaStatus('screen', 'SHARING');
      this.updateStatus({ screenSharing: true });

      // Secure screen share monitoring
      this.monitorScreenShareStopped();

    } catch (error) {
      console.error('Screen sharing denied:', error);
      this.reportViolation('SCREEN_SHARE_BLOCKED', 'HIGH', 'Screen sharing blocked');
      this.updateStatus({ screenSharing: false });
    }
  }

  private monitorScreenShareStopped(): void {
    // Monitor track ends securely without creating security vulnerabilities
    const checkScreenShare = setInterval(() => {
      if (this.mediaStreams.screen) {
        const videoTrack = this.mediaStreams.screen.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState === 'ended') {
          this.sendMediaStatus('screen', 'NOT_SHARING');
          this.reportViolation('SCREEN_SHARE_STOPPED', 'HIGH', 'Screen sharing stopped unexpectedly');
          this.updateStatus({ screenSharing: false });
          clearInterval(checkScreenShare);
        }
      }
    }, 1000);

    this.monitoringIntervals.push(checkScreenShare);
  }

  private async startAudioMonitoring(): Promise<void> {
    try {
      this.mediaStreams.audio = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.sendMediaStatus('audio', 'ACTIVE');
      this.updateStatus({ microphoneActive: true });

      this.startVoiceDetection();

    } catch (error) {
      console.error('Microphone access denied:', error);
      this.reportViolation('MICROPHONE_BLOCKED', 'HIGH', 'Microphone access blocked');
      this.updateStatus({ microphoneActive: false });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeat = {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connectionQuality: this.calculateConnectionQuality(),
        performance: {
          memory: (performance as any).memory,
          timing: performance.timing
        }
      };

      this.safeWebSocketSend({
        type: 'HEARTBEAT',
        ...heartbeat
      });

      this.updateStatus({
        connectionQuality: heartbeat.connectionQuality
      });

    }, 5000);
  }

  private startTabMonitoring(): void {
    const visibilityHandler = () => {
      if (document.hidden) {
        this.reportViolation('TAB_SWITCHED', 'MEDIUM', 'Candidate switched tabs/windows');
      }
    };

    const focusHandler = () => {
      if (!document.hasFocus()) {
        this.reportViolation('WINDOW_SWITCHED', 'MEDIUM', 'Candidate switched windows');
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('blur', focusHandler);

    // Store for cleanup
    this.monitoringIntervals.push({
      cleanup: () => {
        document.removeEventListener('visibilitychange', visibilityHandler);
        window.removeEventListener('blur', focusHandler);
      }
    });
  }

  private startFullscreenMonitoring(): void {
    const interval = setInterval(() => {
      if (!this.isFullScreen()) {
        this.reportViolation('FULLSCREEN_EXIT', 'MEDIUM', 'Candidate exited fullscreen mode');
      }
    }, 2000);

    this.monitoringIntervals.push(interval);
  }

  private startCopyPasteMonitoring(): void {
    const preventDefault = (e: Event, type: string) => {
      e.preventDefault();
      this.reportViolation('COPY_PASTE_ATTEMPT', 'HIGH', `${type} attempt detected`);
    };

    const events = [
      { type: 'copy', handler: (e: Event) => preventDefault(e, 'Copy') },
      { type: 'paste', handler: (e: Event) => preventDefault(e, 'Paste') },
      { type: 'cut', handler: (e: Event) => preventDefault(e, 'Cut') },
      { type: 'contextmenu', handler: (e: Event) => preventDefault(e, 'Right-click') }
    ];

    events.forEach(({ type, handler }) => {
      document.addEventListener(type, handler);
      this.monitoringIntervals.push({
        cleanup: () => document.removeEventListener(type, handler)
      });
    });
  }

  private startFaceDetection(): void {
    // Integration with TensorFlow.js or face-api.js would go here
    console.log('Face detection initialized');
  }

  private startVoiceDetection(): void {
    // Integration with Web Audio API for voice detection
    console.log('Voice detection initialized');
  }

  private handleProctorMessage(message: any): void {
    switch (message.action) {
      case 'TERMINATE':
        this.handleSessionTermination(message.reason);
        break;
      case 'PAUSE':
        this.handleSessionPause();
        break;
      case 'RESUME':
        this.handleSessionResume();
        break;
      case 'WARNING':
        this.showProctorWarning(message.message);
        break;
      case 'REQUEST_FULLSCREEN':
        this.requestFullscreen();
        break;
    }
  }

  private handleSessionTermination(reason: string): void {
    this.stopProctoring();
    // Navigate to termination page
    window.location.href = `/exam/terminated?reason=${encodeURIComponent(reason)}`;
  }

  private handleSessionPause(): void {
    // Implementation for pausing exam
    document.dispatchEvent(new CustomEvent('examPaused'));
  }

  private handleSessionResume(): void {
    // Implementation for resuming exam
    document.dispatchEvent(new CustomEvent('examResumed'));
  }

  private showProctorWarning(message: string): void {
    // Show custom warning modal instead of alert
    const warningEvent = new CustomEvent('proctorWarning', { 
      detail: { message } 
    });
    document.dispatchEvent(warningEvent);
  }

  private reportViolation(type: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', description: string): void {
    this.violationCount++;
    
    this.safeWebSocketSend({
      type: 'VIOLATION',
      sessionId: this.sessionId,
      violationType: type,
      severity: severity,
      description: description,
      timestamp: new Date().toISOString(),
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    this.updateStatus({
      violationsCount: this.violationCount
    });
  }

  private sendMediaStatus(mediaType: string, status: string): void {
    this.safeWebSocketSend({
      type: 'MEDIA_STATUS',
      sessionId: this.sessionId,
      mediaType: mediaType,
      status: status,
      timestamp: new Date().toISOString()
    });
  }

  private safeWebSocketSend(message: any): void {
    if (this.socket && !this.socket.closed) {
      this.socket.next(message);
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  private calculateConnectionQuality(): number {
    // Implement actual connection quality calculation
    const baseQuality = 100;
    const randomVariance = Math.random() * 10 - 5; // -5 to +5
    return Math.max(0, Math.min(100, baseQuality + randomVariance));
  }

  private isFullScreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  requestFullscreen(): void {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  }

  private updateStatus(updates: Partial<ProctoringStatus>): void {
    this.ngZone.run(() => {
      this.statusSubject.next({
        ...this.statusSubject.value,
        ...updates
      });
    });
  }

  private clearAllIntervals(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.monitoringIntervals.forEach(interval => {
      if (interval.cleanup) {
        interval.cleanup();
      } else {
        clearInterval(interval);
      }
    });
    this.monitoringIntervals = [];
  }

  private stopAllMediaStreams(): void {
    Object.values(this.mediaStreams).forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    });
    this.mediaStreams = {};
  }

  private closeWebSocket(): void {
    if (this.socket && !this.socket.closed) {
      this.socket.complete();
    }
  }

  ngOnDestroy(): void {
    this.stopProctoring();
  }
}