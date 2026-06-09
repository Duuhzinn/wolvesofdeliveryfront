import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../service/usuario-service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mais-component',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mais-component.html',
  styleUrl: './mais-component.css',
})
export class MaisComponent {
  modalConfigCorrida = false;
  carregandoClientes = false;
  // CLIENTE
  valorCorrida: any = null;
  salvando = false;

  // ADMIN
  valorGeral: number | null = null;
  salvandoGeral = false;
  clientes: any[] = [];
  valoresOriginais: { [id: number]: number | null } = {};

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get tipoUser(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('tipoUser') ?? '';
  }

  get isAdmin(): boolean { return this.tipoUser === 'ADMIN'; }
  get isCliente(): boolean { return this.tipoUser === 'CLIENTE'; }
  get isMotorista(): boolean { return this.tipoUser === 'MOTORISTA'; }

  get usuarioId(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    return Number(localStorage.getItem('usuarioId'));
  }

  abrirModalConfig(): void {
    if (this.isCliente) {
      this.usuarioService.getConfigRaceClient(this.usuarioId).subscribe({
        next: (config: any) => {
          this.ngZone.run(() => {
            this.valorCorrida = config.valor !== null ? Number(config.valor).toFixed(2) : '0.00';
            this.modalConfigCorrida = true;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.valorCorrida = '0.00';
            this.modalConfigCorrida = true;
            this.cdr.detectChanges();
          });
        },
      });
    }

    if (this.isAdmin) {
      this.modalConfigCorrida = true;
      this.carregandoClientes = true;
      this.usuarioService.getConfigAllRaceClient().subscribe({
        next: (lista: any) => {
          this.ngZone.run(() => {
            this.clientes = lista.content.map((c: any) => {
              return {
                id: c.id,
                valor: c.valor,
                usuario: c.usuario,
                valorEditado: c.valor !== null ? Number(c.valor).toFixed(2) : null,
              };
            });
            this.clientes.forEach((c) => (this.valoresOriginais[c.usuario.id] = c.valor));
            this.carregandoClientes = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.clientes = [];
            this.carregandoClientes = false;
            this.cdr.detectChanges();
          });
        },
      });
    }
  }

  fecharModal(): void {
    this.modalConfigCorrida = false;
    this.valorGeral = null;
    this.clientes = [];
    this.valoresOriginais = {};
  }

  // CLIENTE SALVA O SEU PRÓPRIO
  salvarConfigCliente(): void {
    this.salvando = true;
    this.usuarioService.patchConfigRaceClient(this.usuarioId, this.valorCorrida).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.salvando = false;
          this.modalConfigCorrida = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.salvando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  // ADMIN SALVA VALOR GERAL (ATUALIZA TODOS)
  salvarValorGeral(): void {
    if (this.valorGeral === null) return;
    this.salvandoGeral = true;
    this.usuarioService.patchConfigRaceAll(this.valorGeral).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.salvandoGeral = false;
          this.valorGeral = null;
          // RECARREGA A LISTA
          this.usuarioService.getConfigAllRaceClient().subscribe({
            next: (lista: any) => {
              this.ngZone.run(() => {
                this.clientes = lista.content.map((c: any) => {
                  return {
                    id: c.id,
                    valor: c.valor,
                    usuario: c.usuario,
                    valorEditado: c.valor !== null ? Number(c.valor).toFixed(2) : null,
                  };
                });
                this.clientes.forEach((c) => (this.valoresOriginais[c.usuario.id] = c.valor));
                this.cdr.detectChanges();
              });
            },
          });
        });
      },
      error: () => {
        this.salvandoGeral = false;
      },
    });
  }

  // VERIFICA SE O VALOR DO CLIENTE FOI ALTERADO
  valorAlterado(cliente: any): boolean {
    const original = this.valoresOriginais[cliente.usuario.id] ?? null;
    const atual = cliente.valorEditado ?? null;
    return atual != original;
  }

  // ADMIN SALVA UNITÁRIO
  salvarClienteIndividual(cliente: any): void {
    cliente.salvando = true;
    this.usuarioService.patchConfigRaceClient(cliente.usuario.id, cliente.valorEditado).subscribe({
      next: () => {
        this.ngZone.run(() => {
          cliente.salvando = false;
          this.valoresOriginais[cliente.usuario.id] = cliente.valorEditado;
          // RECARREGA A LISTA
          this.usuarioService.getConfigAllRaceClient().subscribe({
            next: (lista: any) => {
              this.ngZone.run(() => {
                this.clientes = lista.content.map((c: any) => {
                  return {
                    id: c.id,
                    valor: c.valor,
                    usuario: c.usuario,
                    valorEditado: c.valor !== null ? Number(c.valor).toFixed(2) : null,
                  };
                });
                this.clientes.forEach((c) => (this.valoresOriginais[c.usuario.id] = c.valor));
                this.cdr.detectChanges();
              });
            },
          });
        });
      },
      error: () => {
        this.ngZone.run(() => {
          cliente.salvando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  sair(): void {
    if (isPlatformBrowser(this.platformId)) {
      const tipoUser = localStorage.getItem('tipoUser');
      const usuarioId = Number(localStorage.getItem('usuarioId'));

      // PRESERVA AS CREDENCIAIS SALVAS ANTES DE LIMPAR
      const savedLogin = localStorage.getItem('savedLogin');
      const savedSenha = localStorage.getItem('savedSenha');

      if (tipoUser === 'CLIENTE' || tipoUser === 'ADMIN') {
        this.usuarioService.patchStatusUsuario(usuarioId, 0).subscribe({
          next: () => {
            localStorage.clear();
            if (savedLogin) localStorage.setItem('savedLogin', savedLogin);
            if (savedSenha) localStorage.setItem('savedSenha', savedSenha);
            this.router.navigate(['/login']);
          },
          error: () => {
            localStorage.clear();
            if (savedLogin) localStorage.setItem('savedLogin', savedLogin);
            if (savedSenha) localStorage.setItem('savedSenha', savedSenha);
            this.router.navigate(['/login']);
          },
        });
      } else {
        localStorage.clear();
        if (savedLogin) localStorage.setItem('savedLogin', savedLogin);
        if (savedSenha) localStorage.setItem('savedSenha', savedSenha);
        this.router.navigate(['/login']);
      }
    }
  }
}