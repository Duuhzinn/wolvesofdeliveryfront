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
  private dashboardSubscription: StompSubscription | null = null;
  private dashboardSubscription2: StompSubscription | null = null;

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

  // ESCUTA CORRIDA E FILA PARA ATUALIZAR A DASHBOARD EM TEMPO REAL
  conectarDashboard(callback: () => void) {
    this.ativarSeNecessario(() => {
      if (this.dashboardSubscription) {
        this.dashboardSubscription.unsubscribe();
        this.dashboardSubscription = null;
      }
      if (this.dashboardSubscription2) {
        this.dashboardSubscription2.unsubscribe();
        this.dashboardSubscription2 = null;
      }
      // ESCUTA FINALIZAÇÕES E ACEITES
      this.dashboardSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
      });
      // ESCUTA RECUSAS E EXPIRAÇÕES
      this.dashboardSubscription2 = this.client.subscribe('/topic/fila', () => {
        callback();
      });
    });
  }

  // DESCONECTA OS LISTENERS DA DASHBOARD
  desconectarDashboard() {
    if (this.dashboardSubscription) {
      this.dashboardSubscription.unsubscribe();
      this.dashboardSubscription = null;
    }
    if (this.dashboardSubscription2) {
      this.dashboardSubscription2.unsubscribe();
      this.dashboardSubscription2 = null;
    }
  }
}