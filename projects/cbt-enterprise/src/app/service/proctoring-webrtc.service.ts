// import { Injectable } from '@angular/core';
// import { Observable, Subject, from } from 'rxjs';
// import { io, Socket } from 'socket.io-client';

// /**
//  * WebRTC Service
//  * Handles real-time video/audio streaming and screen sharing
//  * 
//  * Phase 1: Basic WebRTC connection and media streaming
//  * Phase 2: Will add quality monitoring, AI analysis, and advanced features
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class WebRTCService {
//   private socket: Socket;
//   private peerConnection: RTCPeerConnection | null = null;
//   private localStream: MediaStream | null = null;
//   private screenStream: MediaStream | null = null;
  
//   // Subjects for component communication
//   private videoStreamSubject = new Subject<MediaStream>();
//   private screenShareSubject = new Subject<MediaStream>();
//   private connectionStatusSubject = new Subject<string>();
//   private violationSubject = new Subject<any>();

//   constructor() {
//     // Initialize Socket.io connection
//     this.socket = io('http://localhost:8080/ws', {
//       transports: ['websocket']
//     });

//     this.setupSocketListeners();
//   }

//   /**
//    * Setup Socket.io event listeners
//    */
//   private setupSocketListeners(): void {
//     // Connection events
//     this.socket.on('connect', () => {
//       console.log('WebSocket connected');
//       this.connectionStatusSubject.next('connected');
//     });

//     this.socket.on('disconnect', () => {
//       console.log('WebSocket disconnected');
//       this.connectionStatusSubject.next('disconnected');
//     });

//     // Signaling events for WebRTC
//     this.socket.on('offer', (data: any) => this.handleOffer(data));
//     this.socket.on('answer', (data: any) => this.handleAnswer(data));
//     this.socket.on('ice-candidate', (data: any) => this.handleIceCandidate(data));

//     // Proctoring events
//     this.socket.on('violation_detected', (data: any) => {
//       this.violationSubject.next(data);
//     });

//     this.socket.on('quality_warning', (data: any) => {
//       console.warn('Quality warning:', data);
//     });
//   }

//   /**
//    * Initialize camera and microphone access
//    */
//   async initializeMediaStream(constraints: MediaStreamConstraints = {}): Promise<MediaStream> {
//     try {
//       const defaultConstraints: MediaStreamConstraints = {
//         video: {
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           frameRate: { ideal: 30 }
//         },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         },
//         ...constraints
//       };

//       this.localStream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
//       this.videoStreamSubject.next(this.localStream);
      
//       return this.localStream;
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//       throw error;
//     }
//   }

//   /**
//    * Start screen sharing
//    */
//   async startScreenShare(): Promise<MediaStream> {
//     try {
//       this.screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: {
//           cursor: 'always',
//           displaySurface: 'window'
//         } as MediaTrackConstraints,
//         audio: false
//       });

//       // Handle when user stops screen share
//       this.screenStream.getTracks().forEach(track => {
//         track.onended = () => {
//           this.stopScreenShare();
//         };
//       });

//       this.screenShareSubject.next(this.screenStream);
//       return this.screenStream;
//     } catch (error) {
//       console.error('Error starting screen share:', error);
//       throw error;
//     }
//   }

//   /**
//    * Stop screen sharing
//    */
//   stopScreenShare(): void {
//     if (this.screenStream) {
//       this.screenStream.getTracks().forEach(track => track.stop());
//       this.screenStream = null;
//       this.screenShareSubject.next(null as any);
//     }
//   }

//   /**
//    * Initialize WebRTC peer connection
//    */
//   initializePeerConnection(config: RTCConfiguration = {}): void {
//     const defaultConfig: RTCConfiguration = {
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' }
//       ],
//       ...config
//     };

//     this.peerConnection = new RTCPeerConnection(defaultConfig);

//     // Add local stream to peer connection
//     if (this.localStream) {
//       this.localStream.getTracks().forEach(track => {
//         if (this.peerConnection) {
//           this.peerConnection.addTrack(track, this.localStream!);
//         }
//       });
//     }

//     // Setup ICE candidate handling
//     this.peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         this.socket.emit('ice-candidate', event.candidate);
//       }
//     };

//     // Setup connection state monitoring
//     this.peerConnection.onconnectionstatechange = () => {
//       if (this.peerConnection) {
//         this.connectionStatusSubject.next(this.peerConnection.connectionState);
//       }
//     };
//   }

//   /**
//    * Create and send WebRTC offer
//    */
//   async createOffer(): Promise<void> {
//     if (!this.peerConnection) {
//       throw new Error('Peer connection not initialized');
//     }

//     try {
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);
//       this.socket.emit('offer', offer);
//     } catch (error) {
//       console.error('Error creating offer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Handle incoming WebRTC offer
//    */
//   private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
//     if (!this.peerConnection) return;

//     try {
//       await this.peerConnection.setRemoteDescription(offer);
//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);
//       this.socket.emit('answer', answer);
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   }

//   /**
//    * Handle incoming WebRTC answer
//    */
//   private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
//     if (!this.peerConnection) return;

//     try {
//       await this.peerConnection.setRemoteDescription(answer);
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   }

//   /**
//    * Handle incoming ICE candidate
//    */
//   private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
//     if (!this.peerConnection) return;

//     try {
//       await this.peerConnection.addIceCandidate(candidate);
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   }

//   /**
//    * Capture screenshot for evidence
//    */
//   async captureScreenshot(): Promise<string> {
//     return new Promise((resolve, reject) => {
//       // This would use html2canvas in a real implementation
//       // For now, return a placeholder
//       resolve('screenshot_data_placeholder');
//     });
//   }

//   /**
//    * Clean up resources
//    */
//   cleanup(): void {
//     if (this.localStream) {
//       this.localStream.getTracks().forEach(track => track.stop());
//       this.localStream = null;
//     }

//     if (this.screenStream) {
//       this.screenStream.getTracks().forEach(track => track.stop());
//       this.screenStream = null;
//     }

//     if (this.peerConnection) {
//       this.peerConnection.close();
//       this.peerConnection = null;
//     }

//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }

//   // Observable getters for components
//   getVideoStream(): Observable<MediaStream> {
//     return this.videoStreamSubject.asObservable();
//   }

//   getScreenShareStream(): Observable<MediaStream> {
//     return this.screenShareSubject.asObservable();
//   }

//   getConnectionStatus(): Observable<string> {
//     return this.connectionStatusSubject.asObservable();
//   }

//   getViolations(): Observable<any> {
//     return this.violationSubject.asObservable();
//   }
// }