import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-relatorios-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios-component.html',
  styleUrl: './relatorios-component.css',
})
export class RelatoriosComponent implements OnInit {
  estatisticas: any[] = [];
  mesAtual: number = new Date().getMonth() + 1;
  anoAtual: number = new Date().getFullYear();

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get isAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('tipoUser') === 'ADMIN';
    return false;
  }

  get tipoUser(): string {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('tipoUser') ?? '';
    return '';
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) this.carregarEstatisticas();
  }

  carregarEstatisticas() {
    const ano = this.anoAtual;
    const usuarioId = Number(localStorage.getItem('usuarioId'));

    if (this.tipoUser === 'CLIENTE') {
      this.usuarioService.getEstatisticasCliente(usuarioId, ano).subscribe({
        next: (data: any) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err: any) => console.log(err),
      });
    } else if (this.tipoUser === 'MOTORISTA') {
      this.usuarioService.getEstatisticasMotorista(usuarioId, ano).subscribe({
        next: (data: any) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err: any) => console.log(err),
      });
    } else {
      this.usuarioService.getEstatisticasAdm(ano).subscribe({
        next: (data: any) => {
          this.estatisticas = this.filtrarMeses(data);
          this.cdr.detectChanges();
        },
        error: (err: any) => console.log(err),
      });
    }
  }

  filtrarMeses(data: any[]): any[] {
    return data
      .filter((_: any, index: number) => index < this.mesAtual)
      .map((stat: any, index: number) => ({
        ...stat,
        mesNumero: index + 1,
        dataInicio: '',
        dataFim: '',
        carregando: false,
        filtrado: false,
      }));
  }

  // RETORNA O MIN DATE DO MÊS (primeiro dia)
  getMinDate(mesNumero: number): string {
    return `${this.anoAtual}-${String(mesNumero).padStart(2, '0')}-01`;
  }

  // RETORNA O MAX DATE DO MÊS (último dia)
  getMaxDate(mesNumero: number): string {
    const ultimoDia = new Date(this.anoAtual, mesNumero, 0).getDate();
    return `${this.anoAtual}-${String(mesNumero).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  }

  pesquisarPorData(stat: any) {
    console.log('pesquisar:', stat.dataInicio, stat.dataFim);
    stat.carregando = true;
    const usuarioId = Number(localStorage.getItem('usuarioId'));

    let clienteId: number | undefined;
    let motoristaId: number | undefined;

    if (this.tipoUser === 'CLIENTE') clienteId = usuarioId;
    else if (this.tipoUser === 'MOTORISTA') motoristaId = usuarioId;

    this.usuarioService.getEstatisticasPorPeriodo(stat.dataInicio, stat.dataFim, clienteId, motoristaId).subscribe({
      next: (data: any) => {
        stat.totalCorridas = data.totalCorridas;
        stat.totalFaturado = data.totalFaturado;
        stat.mediaDiaria = data.mediaDiaria;
        stat.totalPerdidas = data.totalPerdidas;
        stat.totalRecusadas = data.totalRecusadas;
        if (this.isAdmin) stat.motoristaTop = data.motoristaTop;
        stat.carregando = false;
        stat.filtrado = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        stat.carregando = false;
      },
    });
  }

  limparFiltro(stat: any) {
    stat.dataInicio = '';
    stat.dataFim = '';
    stat.filtrado = false;
    this.carregarEstatisticas();
  }
}