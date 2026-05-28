import { ChangeDetectorRef, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from '../service/usuario-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  estatisticas: any[] = [];
  mesAtual: number = new Date().getMonth() + 1; // 1=JANEIRO, 12=DEZEMBRO

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get isAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('tipoUser') === 'ADMIN';
    }
    return false;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarEstatisticas();
    }
  }

  carregarEstatisticas() {
    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
      return;
    }
    const ano = new Date().getFullYear();
    const usuarioId = Number(localStorage.getItem('usuarioId'));
    const tipoUser = localStorage.getItem('tipoUser');

    if (tipoUser === 'CLIENTE') {
      this.usuarioService.getEstatisticasCliente(usuarioId, ano).subscribe({
        next: (data) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else if (tipoUser === 'MOTORISTA') {
      this.usuarioService.getEstatisticasMotorista(usuarioId, ano).subscribe({
        next: (data) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.usuarioService.getEstatisticasAdm(ano).subscribe({
        next: (data) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  // FILTRA APENAS OS MESES ATÉ O MÊS ATUAL
  filtrarMeses(data: any[]): any[] {
    return data.filter((_, index) => index < this.mesAtual);
  }
}
