import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-motorista-bloqueado-component',
  imports: [CommonModule],
  templateUrl: './motorista-bloqueado-component.html',
  styleUrl: './motorista-bloqueado-component.css',
})
export class MotoristaBloqueadoComponent {
  carregando = false;
  motoristas: any[] = [];
  motoristasBloqueadosIds: number[] = [];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get usuarioId(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    return Number(localStorage.getItem('usuarioId'));
  }

  ngOnInit(): void {
    this.carregarMotoristas();
  }

  carregarMotoristas(): void {
    this.carregando = true;
    this.usuarioService.getMotoristaList().subscribe({
      next: (lista: any) => {
        this.ngZone.run(() => {
          this.motoristas = lista;
          this.carregarBloqueados();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.motoristas = [];
          this.carregando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  carregarBloqueados(): void {
    this.usuarioService.getMotoristasBloqueados(this.usuarioId).subscribe({
      next: (lista: any) => {
        this.ngZone.run(() => {
          this.motoristasBloqueadosIds = lista.map((b: any) => b.motoristaId);
          this.carregando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.motoristasBloqueadosIds = [];
          this.carregando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  motoristaEstaBloqueado(motoristaId: number): boolean {
    return this.motoristasBloqueadosIds.includes(motoristaId);
  }

  bloquear(motoristaId: number): void {
    this.motoristasBloqueadosIds.push(motoristaId); // ATUALIZA NA HORA
    this.usuarioService.postBloquearMotorista(this.usuarioId, motoristaId).subscribe({
      next: () => {
        console.log('Motorista ' + motoristaId + ' bloqueado')
      },
      error: (err) => {
        console.error('Erro ao bloquear', err);
        // DESFAZ SE DER ERRO
        this.motoristasBloqueadosIds = this.motoristasBloqueadosIds.filter(
          (id) => id !== motoristaId,
        );
      },
    });
  }

  desbloquear(motoristaId: number): void {
    const idsAnteriores = [...this.motoristasBloqueadosIds];
    this.motoristasBloqueadosIds = this.motoristasBloqueadosIds.filter((id) => id !== motoristaId); // ATUALIZA NA HORA

    this.usuarioService.deleteDesbloquearMotorista(this.usuarioId, motoristaId).subscribe({
      next: () => {
        console.log('Motorista ' + motoristaId + ' desbloqueado')
      },
      error: (err) => {
        console.error('Erro ao desbloquear', err);
        // DESFAZ SE DER ERRO
        this.motoristasBloqueadosIds = idsAnteriores;
      },
    });
  }
}
