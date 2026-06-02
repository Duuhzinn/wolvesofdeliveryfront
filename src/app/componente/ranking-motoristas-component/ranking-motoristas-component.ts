import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-ranking-motoristas-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking-motoristas-component.html',
  styleUrl: './ranking-motoristas-component.css',
})
export class RankingMotoristasComponent implements OnInit {
  motoristas: any[] = [];
  dataInicio: string = '';
  dataFim: string = '';
  carregando: boolean = false;
  pesquisado: boolean = false;
  anoAtual: number = new Date().getFullYear();
  mesAtual: number = new Date().getMonth() + 1;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarRankingInicial();
    }
  }

  carregarRankingInicial() {
    const inicio = `${this.anoAtual}-01-01`;
    const ultimoDia = new Date(this.anoAtual, this.mesAtual, 0).getDate();
    const fim = `${this.anoAtual}-${String(this.mesAtual).padStart(2, '0')}-${ultimoDia}`;
    this.buscarRanking(inicio, fim);
  }

  pesquisar() {
    if (!this.dataInicio || !this.dataFim) return;
    this.buscarRanking(this.dataInicio, this.dataFim);
  }

  buscarRanking(inicio: string, fim: string) {
    this.carregando = true;
    this.usuarioService.getMotoristaList().subscribe({
      next: (data: any) => {
        const motoristas = data.filter((m: any) => m.tipoUser === 'MOTORISTA');
        const requests = motoristas.map((m: any) =>
          this.usuarioService.getEstatisticasPorPeriodo(inicio, fim, undefined, m.id).toPromise()
            .then((stat: any) => ({
              id: m.id,
              nome: m.nome,
              totalCorridas: stat.totalCorridas,
              totalFaturado: stat.totalFaturado,
              mediaDiaria: stat.mediaDiaria,
            }))
        );

        Promise.all(requests).then((resultado: any[]) => {
          this.motoristas = resultado.sort((a, b) => b.totalCorridas - a.totalCorridas);
          this.carregando = false;
          this.pesquisado = true;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.log(err);
        this.carregando = false;
      },
    });
  }
}