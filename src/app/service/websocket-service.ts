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
    this.client.activate();
  }

  conectarCorrida(callback: () => void){
    this.client.onConnect = () => {

      console.log('WebSocket Conectado - Corrida');
      this.client.subscribe('/topic/corrida', () => {
        callback();
      });
    };
    this.client.activate();
  }

  desconectar() {
    this.client.deactivate();
  }
}