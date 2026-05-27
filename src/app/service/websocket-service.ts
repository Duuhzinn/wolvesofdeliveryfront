import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client;

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
    if (this.client.active) {
      this.client.subscribe('/topic/corrida', () => {
        callback();
      });
    } else {
      this.client.onConnect = () => {
        console.log('WebSocket conectado - Corrida');
        this.client.subscribe('/topic/corrida', () => {
          callback();
        });
      };
      this.client.activate();
    }
  }

  desconectarCorrida() {
    // não precisa mais desconectar, o client é compartilhado
  }

  desconectar() {
    this.client.deactivate();
  }
}