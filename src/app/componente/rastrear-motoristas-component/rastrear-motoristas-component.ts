import { Component, OnInit, OnDestroy, NgZone, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsuarioService } from '../../service/usuario-service';
import { WebsocketService } from '../../service/websocket-service';

declare var google: any;

@Component({
  selector: 'app-rastrear-motoristas-component',
  imports: [CommonModule],
  templateUrl: './rastrear-motoristas-component.html',
  styleUrl: './rastrear-motoristas-component.css',
})
export class RastrearMotoristasComponent implements OnInit, OnDestroy {

  corridasAtivas: any[] = [];
  corridaSelecionada: any = null;

  private mapa: any = null;
  private marcador: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private websocketService: WebsocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCorridasEmAndamento();
      this.websocketService.conectarLocalizacao((payload: any) => {
        this.ngZone.run(() => {
          this.atualizarLocalizacao(payload);
        });
      });
    }
  }

  ngOnDestroy() {
    this.websocketService.desconectarLocalizacao();
  }

  carregarCorridasEmAndamento() {
    this.usuarioService.getCorridasAdmAndamento(0).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.corridasAtivas = data.content;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.log('Erro ao carregar corridas:', err),
    });
  }

  atualizarLocalizacao(payload: any) {
    if (this.corridaSelecionada?.motorista?.id === payload.motoristaId) {
      this.moverMarcador(payload.lat, payload.lng);
    }
  }

  selecionarCorrida(event: Event) {
    const corridaId = Number((event.target as HTMLSelectElement).value);
    const corrida = this.corridasAtivas.find(c => c.id === corridaId);
    if (!corrida) return;
    this.corridaSelecionada = corrida;
    setTimeout(() => {
      this.inicializarMapa(-23.5505, -46.6333);
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
      title: this.corridaSelecionada?.motorista?.nome,
    });
  }

  moverMarcador(lat: number, lng: number) {
    if (!this.mapa || !this.marcador) return;
    const pos = { lat, lng };
    this.marcador.setPosition(pos);
    this.mapa.panTo(pos);
  }
}