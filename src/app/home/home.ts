import { ChangeDetectorRef, Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
  dashboardAdmin: any = null;
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

      if (this.tipoUser === 'ADMIN') {
        this.carregarDashboard();
        this.websocketService.conectar(() => {
          this.carregarDashboard();
        });
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
}
