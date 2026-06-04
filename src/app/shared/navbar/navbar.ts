import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  menuAberto = false;
  subAberto: string | null = null;
 
  constructor(private router: Router,
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
 
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (!this.menuAberto) {
      this.subAberto = null;
    }
  }
 
  toggleSub(nome: string): void {
    this.subAberto = this.subAberto === nome ? null : nome;
  }
 
  sair(): void {
    if (isPlatformBrowser(this.platformId)) {
      const tipoUser = localStorage.getItem('tipoUser');
      const usuarioId = Number(localStorage.getItem('usuarioId'));

      if (tipoUser === 'CLIENTE' || tipoUser === 'ADMIN') {
        this.usuarioService.patchStatusUsuario(usuarioId, 0).subscribe({
          next: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          },
          error: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        });
      } else {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
  }
}