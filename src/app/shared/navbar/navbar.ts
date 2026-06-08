import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../service/usuario-service';
import { WebsocketService } from '../../service/websocket-service';
import { StatusService } from '../../service/status-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  menuAberto = false;
  subAberto: string | null = null;
  maisAberto = false;
  maisFechar = false;
  statusMotoristaAtual: number = 0;
  private statusSub: Subscription | null = null;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private websocketService: WebsocketService,
    private statusService: StatusService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.statusMotoristaAtual = Number(localStorage.getItem('statusMotorista') ?? 0);

      // ATUALIZA A BOLINHA QUANDO O STATUS MUDAR VIA SERVICE
      this.statusSub = this.statusService.status$.subscribe((status) => {
        this.statusMotoristaAtual = status;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    // CANCELA A SUBSCRICAO AO DESTRUIR O COMPONENTE
    this.statusSub?.unsubscribe();
  }

  get tipoUser(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('tipoUser') ?? '';
  }

  get nomeUsuario(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('nome') ?? '';
  }

  get isAdmin(): boolean {
    return this.tipoUser === 'ADMIN';
  }
  get isCliente(): boolean {
    return this.tipoUser === 'CLIENTE';
  }
  get isMotorista(): boolean {
    return this.tipoUser === 'MOTORISTA';
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (!this.menuAberto) this.subAberto = null;
  }

  toggleSub(nome: string): void {
    this.subAberto = this.subAberto === nome ? null : nome;
  }

  toggleMais(): void {
    if (this.maisAberto) {
      this.maisFechar = true;
      setTimeout(() => {
        this.maisAberto = false;
        this.maisFechar = false;
      }, 280);
    } else {
      this.maisAberto = true;
    }
  }

  fecharMais(): void {
    this.maisFechar = true;
    setTimeout(() => {
      this.maisAberto = false;
      this.maisFechar = false;
    }, 280);
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
            // RESTAURA AS CREDENCIAIS SALVAS
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
        // RESTAURA AS CREDENCIAIS SALVAS
        if (savedLogin) localStorage.setItem('savedLogin', savedLogin);
        if (savedSenha) localStorage.setItem('savedSenha', savedSenha);
        this.router.navigate(['/login']);
      }
    }
  }
}
