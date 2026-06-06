import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsuarioService } from '../service/usuario-service';
import { WebsocketService } from '../service/websocket-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  tipoUser: string = '';
  nomeUsuario: string = '';
  dashboardAdmin: any = null;
  dashboardCliente: any = null;
  dashboardMotorista: any = null;
  corridasHoje: any[] = [];
  corridasPage: number = 0;
  corridasUltimaPagina: boolean = false;
  corridasCarregando: boolean = false;
  corridasMotoristasHoje: any[] = [];
  corridasMotoristaPage: number = 0;
  corridasMotoristaUltimaPagina: boolean = false;
  corridasMotoristaCarregando: boolean = false;
  usuarioId: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private websocketService: WebsocketService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.tipoUser = localStorage.getItem('tipoUser') ?? '';
      this.usuarioId = Number(localStorage.getItem('usuarioId'));
      this.nomeUsuario = localStorage.getItem('nome') ?? '';

      if (this.tipoUser === 'ADMIN') {
        this.carregarDashboard();
        this.websocketService.conectar(() => {
          this.carregarDashboard();
        });
      }

      if (this.tipoUser === 'CLIENTE') {
        this.carregarDashboardCliente();
        this.carregarCorridasHoje();
      }

      if (this.tipoUser === 'MOTORISTA') {
        this.carregarDashboardMotorista();
        this.carregarCorridasMotoristaHoje();
      }
    }
  }

  ngOnDestroy() {
    this.websocketService.desconectar();
  }

  carregarDashboard() {
    this.usuarioService.getDashboardAdmin(this.usuarioId).subscribe({
      next: (data: any) => {
        this.dashboardAdmin = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }

  carregarDashboardCliente() {
    const hoje = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dataHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

    this.usuarioService.getEstatisticasPorPeriodo(dataHoje, dataHoje, this.usuarioId, undefined).subscribe({
      next: (data: any) => {
        this.dashboardCliente = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }

  carregarCorridasHoje() {
    if (this.corridasCarregando || this.corridasUltimaPagina) return;
    this.corridasCarregando = true;

    const hoje = new Date();

    this.usuarioService.getCorridasDespachanteFinalizada(this.usuarioId, this.corridasPage).subscribe({
      next: (data: any) => {
        const novas = (data.content ?? []).filter((c: any) => {
          if (!c.data_chamada) return false;
          const d = new Date(c.data_chamada);
          return d.getDate() === hoje.getDate() &&
                 d.getMonth() === hoje.getMonth() &&
                 d.getFullYear() === hoje.getFullYear();
        });

        this.corridasHoje = [...this.corridasHoje, ...novas];
        this.corridasUltimaPagina = data.last;
        this.corridasPage++;
        this.corridasCarregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.corridasCarregando = false;
      },
    });
  }

  onCorridasScroll(event: Event) {
    const el = event.target as HTMLElement;
    const chegouNoFim = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    if (chegouNoFim) this.carregarCorridasHoje();
  }

  carregarDashboardMotorista() {
    this.usuarioService.getDashboardMotorista(this.usuarioId).subscribe({
      next: (data: any)=>{
        this.dashboardMotorista = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }

  carregarCorridasMotoristaHoje() {
    if (this.corridasMotoristaCarregando || this.corridasMotoristaUltimaPagina) return;
    this.corridasMotoristaCarregando = true;

    const hoje = new Date();

    this.usuarioService.getCorridasMotoristaFinalizadas(this.usuarioId, this.corridasMotoristaPage).subscribe({
      next: (data: any) => {
        const novas = (data.content ?? []).filter((c: any) => {
          if (!c.data_chamada) return false;
          const d = new Date(c.data_chamada);
          return d.getDate() === hoje.getDate() &&
                 d.getMonth() === hoje.getMonth() &&
                 d.getFullYear() === hoje.getFullYear();
        });

        this.corridasMotoristasHoje = [...this.corridasMotoristasHoje, ...novas];
        this.corridasMotoristaUltimaPagina = data.last;
        this.corridasMotoristaPage++;
        this.corridasMotoristaCarregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.corridasMotoristaCarregando = false;
      },
    });
  }

  onCorridasMotoristaScroll(event: Event) {
    const el = event.target as HTMLElement;
    const chegouNoFim = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    if (chegouNoFim) this.carregarCorridasMotoristaHoje();
  }
}