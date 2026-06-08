import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-mais-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './mais-component.html',
  styleUrl: './mais-component.css',
})
export class MaisComponent {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get tipoUser(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('tipoUser') ?? '';
  }

  get isAdmin(): boolean { return this.tipoUser === 'ADMIN'; }
  get isCliente(): boolean { return this.tipoUser === 'CLIENTE'; }
  get isMotorista(): boolean { return this.tipoUser === 'MOTORISTA'; }

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
          }
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