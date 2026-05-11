import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // necessário para usar [class.open] no template
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  // controla se o menu mobile está aberto ou fechado
  menuAberto = false;

  constructor(private router: Router) {}

  // alterna entre abrir e fechar o menu
  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  public sair() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

}