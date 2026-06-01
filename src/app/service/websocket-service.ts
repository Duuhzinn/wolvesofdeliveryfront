import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client;
  private corridaSubscription: StompSubscription | null = null;
  private recusaSubscription: StompSubscription | null = null;
  private cancelamentoSubscription: StompSubscription | null = null;
  private atualizacaoSubscription: StompSubscription | null = null;

  // CALLBACKS REGISTRADOS
  private onConnectCallbacks: (() => void)[] = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      reconnectDelay: 5000,
    });

    // ÚNICO onConnect - CHAMA TODOS OS CALLBACKS REGISTRADOS
    this.client.onConnect = () => {
      console.log('WebSocket conectado');
      this.onConnectCallbacks.forEach(cb => cb());
    };
  }

  private ativarSeNecessario(callback: () => void) {
    if (this.client.connected) {
      callback();
    } else {
      this.onConnectCallbacks.push(callback);
      if (!this.client.active) {
        this.client.activate();
      }
    }
  }

  conectar(callback: () => void) {
    this.ativarSeNecessario(() => {
      this.client.subscribe('/topic/fila', () => {
        callback();
      });
    });
  }

  conectarCorrida(callbackAceite: () => void, callbackRecusa: () => void) {
    this.ativarSeNecessario(() => {
      if (this.corridaSubscription) {
        this.corridaSubscription.unsubscribe();
        this.corridaSubscription = null;
      }
      if (this.recusaSubscription) {
        this.recusaSubscription.unsubscribe();
        this.recusaSubscription = null;
      }

      this.corridaSubscription = this.client.subscribe('/topic/corrida', () => {
        callbackAceite();
        this.desconectarCorrida();
      });

      this.recusaSubscription = this.client.subscribe('/topic/recusa', () => {
        callbackRecusa();
      });
    });
  }

  desconectarCorrida() {
    if (this.corridaSubscription) {
      this.corridaSubscription.unsubscribe();
      this.corridaSubscription = null;
    }
    if (this.recusaSubscription) {
      this.recusaSubscription.unsubscribe();
      this.recusaSubscription = null;
    }
  }

  desconectar() {
    this.client.deactivate();
  }

  conectarAtualizacao(callback: () => void) {
    this.ativarSeNecessario(() => {
      if (this.atualizacaoSubscription) {
        this.atualizacaoSubscription.unsubscribe();
        this.atualizacaoSubscription = null;
      }
      this.atualizacaoSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
      });
    });
  }

  desconectarAtualizacao() {
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
      this.atualizacaoSubscription = null;
    }
  }

  escutarCancelamento(callback: () => void): void {
    this.ativarSeNecessario(() => {
      if (this.cancelamentoSubscription) {
        this.cancelamentoSubscription.unsubscribe();
        this.cancelamentoSubscription = null;
      }
      this.cancelamentoSubscription = this.client.subscribe('/topic/cancelarChamada', () => {
        callback();
      });
    });
  }
} 