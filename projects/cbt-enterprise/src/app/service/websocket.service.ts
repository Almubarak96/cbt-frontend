// services/websocket.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// If you're using @stomp/stompjs
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketConfig {
  url: string;
  reconnectDelay?: number;
  debug?: boolean;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connectionState = new BehaviorSubject<boolean>(false);
  private messageSubject = new Subject<WebSocketMessage>();
  
  // Default configuration
  private config: WebSocketConfig = {
    url: 'http://localhost:8080/ws',
    reconnectDelay: 5000,
    debug: false
  };

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.config.url),
      reconnectDelay: this.config.reconnectDelay,
      debug: (str: string) => {
        if (this.config.debug) {
          console.log('STOMP:', str);
        }
      }
    });

    this.stompClient.onConnect = (frame: any) => {
      console.log('WebSocket connected successfully', frame);
      this.connectionState.next(true);
    };

    this.stompClient.onStompError = (frame: any) => {
      console.error('WebSocket error:', frame.headers['message']);
      this.connectionState.next(false);
    };

    this.stompClient.onWebSocketError = (error: any) => {
      console.error('WebSocket connection error:', error);
      this.connectionState.next(false);
    };

    this.stompClient.onDisconnect = (frame: any) => {
      console.log('WebSocket disconnected', frame);
      this.connectionState.next(false);
    };
  }

  /**
   * Connect to a specific topic and return observable of messages
   */
  connect(topic: string): Observable<WebSocketMessage> {
    if (!this.stompClient) {
      throw new Error('WebSocket client not initialized');
    }

    // Activate connection if not already active
    if (!this.stompClient.connected) {
      this.stompClient.activate();
    }

    return new Observable<WebSocketMessage>(observer => {
      const subscription = this.stompClient!.subscribe(
        topic,
        (message: IMessage) => {
          try {
            const parsedMessage: WebSocketMessage = {
              ...JSON.parse(message.body),
              timestamp: Date.now()
            };
            observer.next(parsedMessage);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            observer.error(error);
          }
        }
      );

      // Cleanup function
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Send a message to a specific destination
   */
  send(destination: string, payload: any): void {
    if (!this.stompClient?.connected) {
      console.warn('WebSocket not connected. Message not sent.');
      return;
    }

    this.stompClient.publish({
      destination,
      body: JSON.stringify(payload)
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionState.next(false);
    }
  }

  /**
   * Get connection state observable
   */
  getConnectionState(): Observable<boolean> {
    return this.connectionState.asObservable();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize if URL changed
    if (config.url && config.url !== this.config.url) {
      this.disconnect();
      this.initializeWebSocket();
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribeToType(messageType: string): Observable<WebSocketMessage> {
    return this.messageSubject.pipe(
      filter(message => message.type === messageType)
    );
  }

  /**
   * Request data from server (request-response pattern)
   */
  request(destination: string, payload: any, responseTopic: string): Observable<WebSocketMessage> {
    return new Observable<WebSocketMessage>(observer => {
      // Subscribe to response topic first
      const responseSubscription = this.connect(responseTopic).subscribe({
        next: (message) => {
          observer.next(message);
          observer.complete();
          responseSubscription.unsubscribe();
        },
        error: (error) => {
          observer.error(error);
          responseSubscription.unsubscribe();
        }
      });

      // Send request
      this.send(destination, payload);

      // Timeout handling
      const timeout = setTimeout(() => {
        observer.error(new Error('WebSocket request timeout'));
        responseSubscription.unsubscribe();
      }, 10000);

      return () => {
        clearTimeout(timeout);
        responseSubscription.unsubscribe();
      };
    });
  }
}