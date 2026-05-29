import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './service/login-service';
import { Navbar } from './shared/navbar/navbar';
import { FirebaseService } from './service/firebase-service';
import { NotificationStateService } from './service/notificationstate-service';
import { UsuarioService } from './service/usuario-service';

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
  corrida$: any;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private notificationState: NotificationStateService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.corrida$ = this.notificationState.corrida$;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      //this.firebaseService.requestPermission();
      if (localStorage.getItem('tokenAutenticacao') == null) {
        this.router.navigate(['login']);
      } else {
        this.firebaseService.escutarNotificacoes();
      }
    }

    this.notificationState.corrida$.subscribe((mostrar) => {
      if (mostrar) {
        navigator.vibrate([1000, 500, 1000]);
        this.cdr.detectChanges();
      }
    });
  }

  mostrarNavbar(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }

  aceitarCorrida() {
    this.notificationState.fecharTelaCorrida();
    if (isPlatformBrowser(this.platformId)) {
      const motoristaId = Number(localStorage.getItem('usuarioId'));
      const despachanteId = Number(localStorage.getItem('despachanteId'));
      //alert('corrida: ' + corridaId + 'Motorista: ' + motoristaId);
      this.usuarioService.postCriarCorrida(motoristaId, despachanteId).subscribe({
        next: (resp) => {
          console.log('Corrida criada:', resp);
          this.usuarioService.patchOcupado(Number(motoristaId)).subscribe({
            next: (resp) => console.log('Status atualizado:', resp),
            error: (err) => console.log('Erro ao atualizar status:', err),
          });
          this.cdr.detectChanges();
          //REDIRECIONA PARA A ROTA DE CORRIDAS
          this.router.navigate(['/corridas', 'andamento']);
        },
        error: (err) => console.log('Erro ao aceitar corrida:', err),
      });
    }
  }

  recusarCorrida() {
    this.notificationState.fecharTelaCorrida();
    
    if (isPlatformBrowser(this.platformId)) {
      const motoristaId = Number(localStorage.getItem('usuarioId'));
      const despachanteId = Number(localStorage.getItem('despachanteId'));
      const corridaId = Number(localStorage.getItem('corridaId'));

      this.usuarioService.patchRecusarCorrida(motoristaId, corridaId, despachanteId).subscribe({
        next: (resp) => {
          console.log('Corrida recusada:', resp);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
