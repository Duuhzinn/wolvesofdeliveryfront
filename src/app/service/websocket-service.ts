import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private clientFila: Client;
  private clientCorrida: Client | null = null;

  constructor() {
    this.clientFila = new Client({
      webSocketFactory: () =>
        new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      reconnectDelay: 5000,
    });
  }

  conectar(callback: () => void) {
    this.clientFila.onConnect = () => {
      console.log('WebSocket conectado - Fila');
      this.clientFila.subscribe('/topic/fila', () => {
        callback();
      });
    };
    if (!this.clientFila.active) {
      this.clientFila.activate();
    }
  }

  conectarCorrida(callback: () => void) {
    this.clientCorrida = new Client({
      webSocketFactory: () =>
        new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      reconnectDelay: 0,
    });

    this.clientCorrida.onConnect = () => {
      console.log('WebSocket conectado - Corrida');
      this.clientCorrida!.subscribe('/topic/corrida', () => {
        callback();
        this.desconectarCorrida();
      });
    };

    this.clientCorrida.activate();
  }

  desconectarCorrida() {
    if (this.clientCorrida) {
      this.clientCorrida.deactivate();
      this.clientCorrida = null;
    }
  }

  desconectar() {
    this.clientFila.deactivate();
    this.desconectarCorrida();
  }
}