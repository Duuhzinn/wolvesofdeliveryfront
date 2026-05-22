import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './service/login-service';
import { Navbar } from './shared/navbar/navbar';

import { FirebaseService } from './service/firebase-service';
import { NotificationStateService } from './service/notificationstate-service';

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
  mostrarModalCorrida: boolean = false;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private notificationState: NotificationStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      //this.firebaseService.requestPermission();

      if (localStorage.getItem('tokenAutenticacao') == null) {
        this.router.navigate(['login']);
      }
    }

    //ESCUTA O MODAL GLOBAL DE CORRIDA
    this.notificationState.corrida$.subscribe((mostrar) =>{
      this.mostrarModalCorrida = mostrar;
      if(mostrar){
        navigator.vibrate([1000, 500, 1000]);
      }
    })
  }

  mostrarNavbar(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }

  fecharModalCorrida(){
    this.notificationState.fecharTelaCorrida();
  }

  aceitarCorrida(){
    this.notificationState.fecharTelaCorrida();
    alert('Corrida Aceita');
  }
}
