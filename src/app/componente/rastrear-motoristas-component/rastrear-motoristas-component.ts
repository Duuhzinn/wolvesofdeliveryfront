import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../service/websocket-service';

declare var google: any;

interface CorridaAtiva {
  corridaId: number;
  motoristaId: number;
  motoristaNome: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-rastrear-motoristas-component',
  imports: [CommonModule],
  templateUrl: './rastrear-motoristas-component.html',
  styleUrl: './rastrear-motoristas-component.css',
})
export class RastrearMotoristasComponent implements OnInit, OnDestroy {

  corridasAtivas: CorridaAtiva[] = [];
  corridaSelecionada: CorridaAtiva | null = null;

  private mapa: any = null;
  private marcador: any = null;
  private localizacaoSubscription: any = null;

  constructor(private websocketService: WebsocketService, private ngZone: NgZone) {}

  ngOnInit() {
    this.websocketService.conectarLocalizacao((payload: any) => {
      this.ngZone.run(() => {
        this.atualizarCorrida(payload);
      });
    });
  }

  atualizarCorrida(payload: any) {
    const index = this.corridasAtivas.findIndex(c => c.motoristaId === payload.motoristaId);

    if (index >= 0) {
      this.corridasAtivas[index].lat = payload.lat;
      this.corridasAtivas[index].lng = payload.lng;
    } else {
      this.corridasAtivas.push({
        corridaId: payload.corridaId,
        motoristaId: payload.motoristaId,
        motoristaNome: payload.motoristaNome,
        lat: payload.lat,
        lng: payload.lng,
      });
    }

    if (this.corridaSelecionada?.motoristaId === payload.motoristaId) {
      this.moverMarcador(payload.lat, payload.lng);
    }
  }

  selecionarCorrida(event: Event) {
    const motoristaId = Number((event.target as HTMLSelectElement).value);
    const corrida = this.corridasAtivas.find(c => c.motoristaId === motoristaId);
    if (!corrida) return;
    this.corridaSelecionada = corrida;
    setTimeout(() => {
      this.inicializarMapa(corrida.lat, corrida.lng);
    }, 100);
  }

  inicializarMapa(lat: number, lng: number) {
    const el = document.getElementById('mapa');
    if (!el) return;

    this.mapa = new google.maps.Map(el, {
      center: { lat, lng },
      zoom: 15,
    });

    this.marcador = new google.maps.Marker({
      position: { lat, lng },
      map: this.mapa,
      title: this.corridaSelecionada?.motoristaNome,
      icon: '🏍️',
    });
  }

  moverMarcador(lat: number, lng: number) {
    if (!this.mapa || !this.marcador) return;
    const pos = { lat, lng };
    this.marcador.setPosition(pos);
    this.mapa.panTo(pos);
  }

  ngOnDestroy() {
    this.websocketService.desconectarLocalizacao();
  }
}