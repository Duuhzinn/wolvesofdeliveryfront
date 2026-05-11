import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LoginService } from './service/login-service';
import { Navbar } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, Navbar],
  providers: [LoginService],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('wolvesofdelivery');

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    // Verifica se está no navegador
    if (isPlatformBrowser(this.platformId)) {

      if (localStorage.getItem('token') == null) {
        this.router.navigate(['login']);
      }

    }
  }

  public sair() {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.clear();
      this.router.navigate(['login']);

    }
  }

}