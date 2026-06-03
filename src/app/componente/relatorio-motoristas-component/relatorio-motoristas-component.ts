import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-relatorio-motoristas-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio-motoristas-component.html',
  styleUrl: './relatorio-motoristas-component.css',
})
export class RelatorioMotoristasComponent implements OnInit {
  motoristas: any[] = [];
  anoAtual: number = new Date().getFullYear();

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarMotoristas();
    }
  }

  carregarMotoristas() {
    this.usuarioService.getMotoristaList().subscribe({
      next: (data: any) => {
        this.motoristas = data
          .filter((m: any) => m.tipoUser === 'MOTORISTA')
          .map((m: any) => ({
            ...m,
            totalCorridas: 0,
            totalFaturado: 0,
            mediaDiaria: 0,
            totalPerdidas: 0,
            totalRecusadas: 0,
            dataInicio: '',
            dataFim: '',
            carregando: false,
            filtrado: false,
          }));
        this.carregarEstatisticasIniciais();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }

  carregarEstatisticasIniciais() {
    const mesAtual = new Date().getMonth() + 1;
    const inicio = `${this.anoAtual}-01-01`;
    const fim = `${this.anoAtual}-${String(mesAtual).padStart(2, '0')}-${new Date(this.anoAtual, mesAtual, 0).getDate()}`;

    this.motoristas.forEach((motorista: any) => {
      motorista.carregando = true;
      this.usuarioService.getEstatisticasPorPeriodo(inicio, fim, undefined, motorista.id).subscribe({
        next: (data: any) => {
          motorista.totalCorridas = data.totalCorridas;
          motorista.totalFaturado = data.totalFaturado;
          motorista.mediaDiaria = data.mediaDiaria;
          motorista.totalPerdidas = data.totalPerdidas;
          motorista.totalRecusadas = data.totalRecusadas;
          motorista.aproveitamento = data.aproveitamento;
          motorista.carregando = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          motorista.carregando = false;
          console.log(err);
        },
      });
    });
  }

  pesquisarPorData(motorista: any) {
    if (!motorista.dataInicio || !motorista.dataFim) return;
    motorista.carregando = true;

    this.usuarioService.getEstatisticasPorPeriodo(motorista.dataInicio, motorista.dataFim, undefined, motorista.id).subscribe({
      next: (data: any) => {
        motorista.totalCorridas = data.totalCorridas;
        motorista.totalFaturado = data.totalFaturado;
        motorista.mediaDiaria = data.mediaDiaria;
        motorista.totalPerdidas = data.totalPerdidas;
        motorista.totalRecusadas = data.totalRecusadas;
        motorista.aproveitamento = data.aproveitamento;
        motorista.carregando = false;
        motorista.filtrado = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        motorista.carregando = false;
        console.log(err);
      },
    });
  }

  limparFiltro(motorista: any) {
    motorista.dataInicio = '';
    motorista.dataFim = '';
    motorista.filtrado = false;
    this.carregarEstatisticasIniciais();
  }
}