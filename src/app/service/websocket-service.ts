import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client;
  private corridaSubscription: StompSubscription | null = null;

  constructor() {
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      reconnectDelay: 5000,
    });
  }

  conectar(callback: () => void) {
    this.client.onConnect = () => {
      console.log('WebSocket conectado');
      this.client.subscribe('/topic/fila', () => {
        callback();
      });
    };
    if (!this.client.active) {
      this.client.activate();
    }
  }

  conectarCorrida(callback: () => void) {
    const subscribe = () => {
      if (this.corridaSubscription) {
        this.corridaSubscription.unsubscribe();
        this.corridaSubscription = null;
      }
      this.corridaSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
        this.desconectarCorrida();
      });
    };

    if (this.client.active) {
      subscribe();
    } else {
      this.client.onConnect = () => {
        console.log('WebSocket conectado - Corrida');
        subscribe();
      };
      this.client.activate();
    }
  }

  desconectarCorrida() {
    if (this.corridaSubscription) {
      this.corridaSubscription.unsubscribe();
      this.corridaSubscription = null;
    }
  }

  desconectar() {
    this.client.deactivate();
  }
}
