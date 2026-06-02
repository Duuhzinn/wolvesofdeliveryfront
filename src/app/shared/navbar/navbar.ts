import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
    // Limpe o token/sessão aqui se necessário
    // localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}