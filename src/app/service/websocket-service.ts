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
  private localizacaoSubscription: StompSubscription | null = null;

  // CALLBACKS REGISTRADOS COM CHAVE UNICA - EVITA DUPLICATAS
  private onConnectCallbacks: Map<string, () => void> = new Map();

  constructor() {
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      reconnectDelay: 5000,
    });

    // RECONECTA E REINSCREVE EM TODOS OS TOPICOS ATIVOS
    this.client.onConnect = () => {
      console.log('WebSocket conectado');
      this.onConnectCallbacks.forEach((cb) => cb());
    };
  }

  // REGISTRA CALLBACK COM CHAVE - SOBRESCREVE SE JA EXISTIR
  private ativarSeNecessario(key: string, callback: () => void) {
    this.onConnectCallbacks.set(key, callback);
    if (this.client.connected) {
      callback();
    } else if (!this.client.active) {
      this.client.activate();
    }
  }

  // ESCUTA FILA DE CORRIDAS
  conectar(callback: () => void) {
    this.ativarSeNecessario('fila', () => {
      this.client.subscribe('/topic/fila', () => {
        callback();
      });
    });
  }

  // ESCUTA ACEITE E RECUSA DE CORRIDA
  conectarCorrida(
    callbackAceite: () => void,
    callbackRecusa: (proximoMotoristaId: number | null) => void,
  ) {
    this.ativarSeNecessario('corrida', () => {
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

      this.recusaSubscription = this.client.subscribe('/topic/recusa', (message) => {
        const body = message.body;
        const proximoMotoristaId = body && body !== 'null' ? JSON.parse(body) : null;
        callbackRecusa(proximoMotoristaId);
      });
    });
  }

  // DESCONECTA LISTENERS DE CORRIDA
  desconectarCorrida() {
    if (this.corridaSubscription) {
      this.corridaSubscription.unsubscribe();
      this.corridaSubscription = null;
    }
    if (this.recusaSubscription) {
      this.recusaSubscription.unsubscribe();
      this.recusaSubscription = null;
    }
    this.onConnectCallbacks.delete('corrida');
  }

  desconectar() {
    this.client.deactivate();
  }

  // ESCUTA ATUALIZACOES DE CORRIDA EM ANDAMENTO
  conectarAtualizacao(callback: () => void) {
    this.ativarSeNecessario('atualizacao', () => {
      if (this.atualizacaoSubscription) {
        this.atualizacaoSubscription.unsubscribe();
        this.atualizacaoSubscription = null;
      }
      this.atualizacaoSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
      });
    });
  }

  // DESCONECTA LISTENER DE ATUALIZACAO
  desconectarAtualizacao() {
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
      this.atualizacaoSubscription = null;
    }
    this.onConnectCallbacks.delete('atualizacao');
  }

  // ESCUTA CANCELAMENTO DE CORRIDA
  escutarCancelamento(callback: () => void): void {
    this.ativarSeNecessario('cancelamento', () => {
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
    this.ativarSeNecessario('dashboard', () => {
      if (this.dashboardSubscription) {
        this.dashboardSubscription.unsubscribe();
        this.dashboardSubscription = null;
      }
      if (this.dashboardSubscription2) {
        this.dashboardSubscription2.unsubscribe();
        this.dashboardSubscription2 = null;
      }
      // ESCUTA FINALIZACOES E ACEITES
      this.dashboardSubscription = this.client.subscribe('/topic/corrida', () => {
        callback();
      });
      // ESCUTA RECUSAS E EXPIRACOES
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
    this.onConnectCallbacks.delete('dashboard');
  }

  // ESCUTA LOCALIZACAO DOS MOTORISTAS EM TEMPO REAL
  conectarLocalizacao(callback: (payload: any) => void) {
    this.ativarSeNecessario('localizacao', () => {
      if (this.localizacaoSubscription) {
        this.localizacaoSubscription.unsubscribe();
        this.localizacaoSubscription = null;
      }
      this.localizacaoSubscription = this.client.subscribe('/topic/localizacao', (message) => {
        const payload = JSON.parse(message.body);
        callback(payload);
      });
    });
  }

  // DESCONECTA LISTENER DE LOCALIZACAO
  desconectarLocalizacao() {
    if (this.localizacaoSubscription) {
      this.localizacaoSubscription.unsubscribe();
      this.localizacaoSubscription = null;
    }
    this.onConnectCallbacks.delete('localizacao');
  }
}
