// unified-websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
//import * as Stomp from 'stompjs';

import { Client, IMessage, Stomp } from '@stomp/stompjs';
//import SockJS from 'sockjs-client';

@Injectable({
    providedIn: 'root'
})
export class UnifiedWebSocketService {
    private stompClient: any;
    private connected: boolean = false;
    private connectionSubject: Subject<boolean> = new Subject<boolean>();

    // Timer subscriptions
    private timerSubscriptions: Map<number, any> = new Map();
    private examCompletionSubscriptions: Map<number, any> = new Map();

    // Analytics subscriptions
    private analyticsSubscriptions: Map<number, any> = new Map();

    connect(): void {
        if (this.connected) return;

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, (frame: any) => {
            console.log('WebSocket Connected: ' + frame);
            this.connected = true;
            this.connectionSubject.next(true);

            // Re-subscribe to any existing subscriptions
            this.reconnectSubscriptions();

        }, (error: any) => {
            console.error('WebSocket connection error: ', error);
            this.connected = false;
            this.connectionSubject.next(false);
            setTimeout(() => this.connect(), 5000);
        });
    }

    disconnect(): void {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.connected = false;
                this.connectionSubject.next(false);
            });
        }
    }

    // ==================== TIMER METHODS ====================

    subscribeToTimer(sessionId: number): Observable<number> {
        const subject = new Subject<number>();

        if (this.stompClient && this.connected) {
            const subscription = this.stompClient.subscribe(`/topic/timer/${sessionId}`, (message: any) => {
                const timeLeft = Number(message.body);
                subject.next(timeLeft);
            });

            this.timerSubscriptions.set(sessionId, subscription);
        }

        return subject.asObservable();
    }

    subscribeToExamCompletion(sessionId: number): Observable<string> {
        const subject = new Subject<string>();

        if (this.stompClient && this.connected) {
            const subscription = this.stompClient.subscribe(`/topic/exam-completed/${sessionId}`, (message: any) => {
                subject.next(message.body);
            });

            this.examCompletionSubscriptions.set(sessionId, subscription);
        }

        return subject.asObservable();
    }

    unsubscribeFromTimer(sessionId: number): void {
        const subscription = this.timerSubscriptions.get(sessionId);
        if (subscription) {
            subscription.unsubscribe();
            this.timerSubscriptions.delete(sessionId);
        }
    }

    unsubscribeFromExamCompletion(sessionId: number): void {
        const subscription = this.examCompletionSubscriptions.get(sessionId);
        if (subscription) {
            subscription.unsubscribe();
            this.examCompletionSubscriptions.delete(sessionId);
        }
    }

    // ==================== ANALYTICS METHODS ====================

    subscribeToAnalytics(testId: number): Observable<any> {
        const subject = new Subject<any>();

        if (this.stompClient && this.connected) {
            const subscription = this.stompClient.subscribe(`/topic/analytics/${testId}`, (message: any) => {
                try {
                    const data = JSON.parse(message.body);
                    subject.next(data);
                } catch (error) {
                    console.error('Error parsing analytics message:', error);
                }
            });

            this.analyticsSubscriptions.set(testId, subscription);

            // Request initial data
            this.stompClient.send(`/app/analytics/${testId}`, {});
        }

        return subject.asObservable();
    }

    sendAnalyticsSubscription(testId: number): void {
        if (this.stompClient && this.connected) {
            this.stompClient.send(`/app/analytics/${testId}/subscribe`, {});
        }
    }

    sendAnalyticsUnsubscription(testId: number): void {
        if (this.stompClient && this.connected) {
            this.stompClient.send(`/app/analytics/${testId}/unsubscribe`, {});
        }
    }

    unsubscribeFromAnalytics(testId: number): void {
        const subscription = this.analyticsSubscriptions.get(testId);
        if (subscription) {
            subscription.unsubscribe();
            this.analyticsSubscriptions.delete(testId);
        }
    }

    // ==================== UTILITY METHODS ====================

    private reconnectSubscriptions(): void {
        // Reconnect timer subscriptions
        this.timerSubscriptions.forEach((subscription, sessionId) => {
            this.subscribeToTimer(sessionId);
        });

        // Reconnect exam completion subscriptions
        this.examCompletionSubscriptions.forEach((subscription, sessionId) => {
            this.subscribeToExamCompletion(sessionId);
        });

        // Reconnect analytics subscriptions
        this.analyticsSubscriptions.forEach((subscription, testId) => {
            this.subscribeToAnalytics(testId);
        });
    }

    isConnected(): boolean {
        return this.connected;
    }

    getConnectionStatus(): Observable<boolean> {
        return this.connectionSubject.asObservable();
    }

    // Clean up all subscriptions
    cleanup(): void {
        this.timerSubscriptions.forEach(subscription => subscription.unsubscribe());
        this.examCompletionSubscriptions.forEach(subscription => subscription.unsubscribe());
        this.analyticsSubscriptions.forEach(subscription => subscription.unsubscribe());

        this.timerSubscriptions.clear();
        this.examCompletionSubscriptions.clear();
        this.analyticsSubscriptions.clear();
    }
}