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

  conectarCorrida(callbackAceite: () => void, callbackRecusa: () => void) {
    const subscribe = () => {
      // LIMPA SUBSCRIPTIONS ANTIGAS
      if (this.corridaSubscription) {
        this.corridaSubscription.unsubscribe();
        this.corridaSubscription = null;
      }
      if (this.recusaSubscription) {
        this.recusaSubscription.unsubscribe();
        this.recusaSubscription = null;
      }

      // INSCREVE NOS DOIS TOPICS DE UMA VEZ
      this.corridaSubscription = this.client.subscribe('/topic/corrida', () => {
        callbackAceite();
        this.desconectarCorrida();
      });

      this.recusaSubscription = this.client.subscribe('/topic/recusa', () => {
        callbackRecusa();
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
    if (this.recusaSubscription) {
      this.recusaSubscription.unsubscribe();
      this.recusaSubscription = null;
    }
  }

  desconectar() {
    this.client.deactivate();
  }

  private atualizacaoSubscription: StompSubscription | null = null;
  conectarAtualizacao(callback: () => void) {
    const subscribe = () => {
      if (this.atualizacaoSubscription) {
        this.atualizacaoSubscription.unsubscribe();
        this.atualizacaoSubscription = null;
      }
      this.atualizacaoSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
      });
    };

    if (this.client.active) {
      subscribe();
    } else {
      this.client.onConnect = () => {
        console.log('WebSocket conectado - Atualização');
        subscribe();
      };
      this.client.activate();
    }
  }

  desconectarAtualizacao() {
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
      this.atualizacaoSubscription = null;
    }
  }

  escutarCancelamento(callback: () => void): void {
    const subscribe = () => {
      if (this.cancelamentoSubscription) {
        this.cancelamentoSubscription.unsubscribe();
        this.cancelamentoSubscription = null;
      }
      this.cancelamentoSubscription = this.client.subscribe('/topic/cancelarChamada', () => {
        callback();
      });
    };

    // GARANTE QUE VAI INSCREVER QUANDO CONECTAR
    const originalOnConnect = this.client.onConnect;
    this.client.onConnect = (frame) => {
      if (originalOnConnect) originalOnConnect.call(this.client, frame);
      subscribe();
    };

    if (this.client.active) {
      subscribe();
    } else {
      this.client.activate();
    }
  }
}
