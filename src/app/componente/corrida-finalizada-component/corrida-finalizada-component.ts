import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-corrida-finalizada-component',
  imports: [CommonModule],
  templateUrl: './corrida-finalizada-component.html',
  styleUrl: './corrida-finalizada-component.css',
})
export class CorridaFinalizadaComponent implements OnInit, OnDestroy {

  paginaAtual: number = 0;
  totalPaginas: number = 0;
  carregando: boolean = false;
  corridas: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCorridas();
    }
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const posicaoAtual = window.innerHeight + window.scrollY;
    const alturaTotal = document.body.offsetHeight;

    if (
      posicaoAtual >= alturaTotal - 100 &&
      !this.carregando &&
      this.paginaAtual < this.totalPaginas - 1
    ) {
      this.paginaAtual++;
      this.carregarCorridas();
    }
  }

  carregarCorridas() {
    if (this.carregando) return;
    if (!isPlatformBrowser(this.platformId)) return;
    this.carregando = true;

    const usuarioId = Number(localStorage.getItem('usuarioId'));
    const tipoUser = localStorage.getItem('tipoUser');

    if (!tipoUser || !usuarioId) {
      this.carregando = false;
      return;
    }

    const next = (data: any) => {
      this.corridas = [...this.corridas, ...data.content];
      this.totalPaginas = data.totalPages;
      this.carregando = false;
      this.cdr.detectChanges();
    };
    const error = (err: any) => {
      console.log(err);
      this.carregando = false;
    };

    if (tipoUser === 'CLIENTE') {
      this.usuarioService.getCorridasClienteFinalizadas(usuarioId, this.paginaAtual).subscribe({ next, error });
    } else if (tipoUser === 'MOTORISTA') {
      this.usuarioService.getCorridasMotoristaFinalizadas(usuarioId, this.paginaAtual).subscribe({ next, error });
    } else {
      this.usuarioService.getCorridasAdmFinalizadas(this.paginaAtual).subscribe({ next, error });
    }
  }
}