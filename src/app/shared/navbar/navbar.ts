import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
 
  constructor(private router: Router) {}
 
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (!this.menuAberto) {
      this.subAberto = null;
    }
  }
 
  toggleSub(nome: string): void {
    this.subAberto = this.subAberto === nome ? null : nome;
  }

  fecharMenuDepois() {

  setTimeout(() => {
    this.toggleMenu();
  }, 100);

}

 
  sair(): void {
    // Limpe o token/sessão aqui se necessário
    // localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}