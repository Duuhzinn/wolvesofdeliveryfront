import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './service/login-service';
import { Navbar } from './shared/navbar/navbar';

import { FirebaseService } from './service/firebase-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, Navbar, CommonModule],
  providers: [LoginService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('wolvesofdelivery');

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      //this.firebaseService.requestPermission();

      if (localStorage.getItem('tokenAutenticacao') == null) {
        this.router.navigate(['login']);
      }
    }
  }

  mostrarNavbar(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }
}
