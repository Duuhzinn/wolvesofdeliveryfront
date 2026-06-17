import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
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
  sinalPerdido: boolean = false;

  private mapa: any = null;
  private marcadores: Map<string, any> = new Map(); // ✅ MAPA DE MARCADORES POR MOTORISTA
  private timeoutSinal: any = null;

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

      this.websocketService.conectarAtualizacao(() => {
        this.ngZone.run(() => {
          this.recarregarCorridas();
        });
      });
    }
  }

  ngOnDestroy() {
    this.websocketService.desconectarLocalizacao();
    this.websocketService.desconectarAtualizacao();
    if (this.timeoutSinal) clearTimeout(this.timeoutSinal);
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

  recarregarCorridas() {
    this.usuarioService.getCorridasAdmAndamento(0).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.corridasAtivas = data.content;

          // ✅ REMOVE MARCADORES DE CORRIDAS QUE NÃO ESTÃO MAIS ATIVAS
          this.marcadores.forEach((marcador, motoristaId) => {
            const aindaAtivo = this.corridasAtivas.find(
              c => String(c.motorista?.id) === motoristaId
            );
            if (!aindaAtivo) {
              marcador.map = null;
              this.marcadores.delete(motoristaId);
            }
          });

          if (this.corridaSelecionada) {
            const aindaAtiva = this.corridasAtivas.find(c => c.id === this.corridaSelecionada.id);
            if (!aindaAtiva) {
              this.corridaSelecionada = null;
              this.sinalPerdido = false;
              if (this.timeoutSinal) clearTimeout(this.timeoutSinal);
            }
          }

          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.log('Erro ao recarregar corridas:', err),
    });
  }

  atualizarLocalizacao(payload: any) {
    const motoristaId = String(payload.motoristaId);

    // ✅ ATUALIZA OU CRIA MARCADOR PARA ESSE MOTORISTA
    if (this.mapa) {
      if (this.marcadores.has(motoristaId)) {
        this.marcadores.get(motoristaId).position = { lat: payload.lat, lng: payload.lng };
      } else {
        const corrida = this.corridasAtivas.find(c => String(c.motorista?.id) === motoristaId);
        const nome = corrida?.motorista?.nome ?? 'Motorista';
        const markerEl = document.createElement('div');
        markerEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;';
        markerEl.innerHTML = `
          <div style="background:#3B3870;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
            ${nome}
          </div>
          <div style="font-size:22px;">🐺</div>`;

        const marcador = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: payload.lat, lng: payload.lng },
          map: this.mapa,
          content: markerEl,
        });
        this.marcadores.set(motoristaId, marcador);
      }
    }

    // ✅ SE É O MOTORISTA SELECIONADO, CENTRALIZA E ATUALIZA SINAL
    if (String(this.corridaSelecionada?.motorista?.id) === motoristaId) {
      this.sinalPerdido = false;
      this.mapa?.panTo({ lat: payload.lat, lng: payload.lng });
      this.reiniciarTimeoutSinal();
      this.cdr.detectChanges();
    }
  }

  reiniciarTimeoutSinal() {
    if (this.timeoutSinal) clearTimeout(this.timeoutSinal);
    this.timeoutSinal = setTimeout(() => {
      this.ngZone.run(() => {
        this.sinalPerdido = true;
        this.cdr.detectChanges();
      });
    }, 15000);
  }

  selecionarCorrida(event: Event) {
    const corridaId = Number((event.target as HTMLSelectElement).value);
    const corrida = this.corridasAtivas.find((c) => c.id === corridaId);
    if (!corrida) return;
    this.corridaSelecionada = corrida;
    this.sinalPerdido = false;
    if (this.timeoutSinal) clearTimeout(this.timeoutSinal);

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
      mapId: 'DEMO_MAP_ID',
    });

    // ✅ RECRIA TODOS OS MARCADORES EXISTENTES NO NOVO MAPA
    this.marcadores.forEach((marcador, motoristaId) => {
      marcador.map = this.mapa;
    });
  }
}