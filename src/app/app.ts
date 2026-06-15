import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './service/login-service';
import { Navbar } from './shared/navbar/navbar';
import { FirebaseService } from './service/firebase-service';
import { NotificationStateService } from './service/notificationstate-service';
import { UsuarioService } from './service/usuario-service';
import { WebsocketService } from './service/websocket-service';
import { LocalizacaoService } from './service/localizacao-service';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics } from '@capacitor/haptics';

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
  private static listenersRegistrados = false;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private notificationState: NotificationStateService,
    private usuarioService: UsuarioService,
    private websocketService: WebsocketService,
    private localizacaoService: LocalizacaoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.corrida$ = this.notificationState.corrida$;

    if (Capacitor.isNativePlatform() && !App.listenersRegistrados) {
      App.listenersRegistrados = true;
      this.registrarListenersNativos();
      this.registrarListenerResume(); // ✅ ADICIONADO
    }
  }

  private registrarListenersNativos() {
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      const title = notification.data?.['title'] ?? notification.title ?? '';
      const data = notification.data;
      if (title === 'Nova Corrida 🏍️') {
        const corridaId = data?.['corridaId'];
        const despachanteId = data?.['despachanteId'];
        if (corridaId) localStorage.setItem('corridaId', corridaId);
        if (despachanteId) localStorage.setItem('despachanteId', despachanteId);
        Haptics.vibrate({ duration: 1000 });
        this.notificationState.mostrarTelaCorrida();
        this.cdr.detectChanges();
      }
      if (title === 'Corrida Perdida ❌') {
        this.notificationState.fecharTelaCorrida();
        PushNotifications.removeAllDeliveredNotifications();
        this.cdr.detectChanges();
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      const title = data?.['title'] ?? action.notification.title ?? '';
      if (title === 'Nova Corrida 🏍️') {
        const corridaId = data?.['corridaId'];
        const despachanteId = data?.['despachanteId'];
        if (corridaId) localStorage.setItem('corridaId', corridaId);
        if (despachanteId) localStorage.setItem('despachanteId', despachanteId);
        setTimeout(() => {
          this.notificationState.mostrarTelaCorrida();
          this.cdr.detectChanges();
        }, 1000);
      }
    });
  }

  // ✅ ADICIONADO: RETOMA O ENVIO DE LOCALIZAÇÃO QUANDO O APP VOLTA AO FOREGROUND
  private registrarListenerResume() {
    CapacitorApp.addListener('resume', () => {
      if (isPlatformBrowser(this.platformId)) {
        const statusMotorista = localStorage.getItem('statusMotorista');
        const corridaId = Number(localStorage.getItem('corridaId'));
        const motoristaId = Number(localStorage.getItem('usuarioId'));
        const motoristaNome = localStorage.getItem('nome') ?? 'Motorista';

        if (statusMotorista === '2' && corridaId) {
          console.log('App retomado - reiniciando envio de localização');
          this.localizacaoService.iniciarEnvioLocalizacao(motoristaId, motoristaNome, corridaId);
        }
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('tokenAutenticacao') == null) {
        this.router.navigate(['login']);
      } else {
        this.firebaseService.escutarNotificacoes();

        const params = new URLSearchParams(window.location.search);
        const corridaId = params.get('corridaId');
        const despachanteId = params.get('despachanteId');

        if (corridaId && despachanteId) {
          localStorage.setItem('corridaId', corridaId);
          localStorage.setItem('despachanteId', despachanteId);
          this.notificationState.mostrarTelaCorrida();
        }
      }
    }

    this.notificationState.corrida$.subscribe((mostrar) => {
      if (mostrar) {
        this.cdr.detectChanges();
      }
    });

    this.websocketService.escutarCancelamento(() => {
      this.notificationState.fecharTelaCorrida();
      this.cdr.detectChanges();
    });
  }

  mostrarNavbar(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }

  aceitarCorrida() {
    this.notificationState.fecharTelaCorrida();
    PushNotifications.removeAllDeliveredNotifications();
    window.history.replaceState({}, '', '/home');
    if (isPlatformBrowser(this.platformId)) {
      const motoristaId = Number(localStorage.getItem('usuarioId'));
      const motoristaNome = localStorage.getItem('nome') ?? 'Motorista';
      const corridaId = Number(localStorage.getItem('corridaId'));
      this.usuarioService.patchAceitarCorrida(corridaId).subscribe({
        next: (resp) => {
          console.log('Corrida criada:', resp);
          this.localizacaoService.iniciarEnvioLocalizacao(motoristaId, motoristaNome, corridaId);
          this.usuarioService.patchOcupado(Number(motoristaId)).subscribe({
            next: (resp) => console.log('Status atualizado:', resp),
            error: (err) => console.log('Erro ao atualizar status:', err),
          });
          this.cdr.detectChanges();
          this.router.navigate(['/corridas', 'andamento']);
        },
        error: (err) => console.log('Erro ao aceitar corrida:', err),
      });
    }
  }

  recusarCorrida() {
    this.notificationState.fecharTelaCorrida();
    PushNotifications.removeAllDeliveredNotifications();
    window.history.replaceState({}, '', '/home');

    if (isPlatformBrowser(this.platformId)) {
      const motoristaId = Number(localStorage.getItem('usuarioId'));
      const despachanteId = Number(localStorage.getItem('despachanteId'));
      const corridaId = Number(localStorage.getItem('corridaId'));

      this.usuarioService.patchRecusarCorrida(motoristaId, corridaId, despachanteId).subscribe({
        next: (resp) => {
          console.log('Corrida recusada:', resp);
          this.cdr.detectChanges();
        },
      });
    }
  }
}