import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';

import { Client, Stomp } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private stompClient!: Client;
  public timeLeft$ = new BehaviorSubject<number>(0);

  connect(sessionId: number) {
    this.stompClient = new Client({
      webSocketFactory: () =>
        SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe(`/topic/timer/${sessionId}`, (msg) => {
          this.timeLeft$.next(Number(msg.body));
        });
      },
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }
}
