import { Injectable } from '@angular/core';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenFB } from '../model/tokenfb';
import { AppConstants } from '../app-constants';
import { NotificationStateService } from './notificationstate-service';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private http: HttpClient,
    private notificationState: NotificationStateService,
  ) {}

  async requestPermission(usuarioId: number) {
    if (Capacitor.isNativePlatform()) {
      // MODO NATIVO (APK ANDROID)
      await this.requestPermissionNativo(usuarioId);
    } else {
      // MODO WEB/PWA (BROWSER)
      await this.requestPermissionWeb(usuarioId);
    }
  }

  // ==================== NATIVO ====================
  private async requestPermissionNativo(usuarioId: number) {
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive !== 'granted') {
      console.error('Permissão de notificação negada');
      return;
    }

    await PushNotifications.register();

    // RECEBE O TOKEN FCM NATIVO
    PushNotifications.addListener('registration', (token) => {
      console.log('Token FCM nativo:', token.value);
      this.salvarToken(usuarioId, token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Erro ao registrar notificação nativa:', err);
    });
  }

  // ==================== WEB/PWA ====================
  private async requestPermissionWeb(usuarioId: number) {
    try {
      const token = await getToken(messaging, {
        vapidKey:
          'BFt6_3dNzUiTBpx8Y38YJwrprc2tiIxHXUD1DDfG2az95n5aFPOqmINuCZ1ZrHfr3aWQlU0akPsk_qvbnHPGllo',
      });
      console.log('Token gerado (web):', token);
      this.salvarToken(usuarioId, token);

      onMessage(messaging, (payload) => {
        console.log('Mensagem recebida (web):', payload);
        this.processarNotificacao(
          payload.data?.['title'] ?? '',
          payload.data
        );
      });
    } catch (error) {
      console.error('Erro ao gerar token (web):', error);
    }
  }

  // ==================== COMPARTILHADO ====================
  private salvarToken(usuarioId: number, token: string) {
    const tokenFB = new TokenFB();
    tokenFB.token = token;

    const tokenJWT = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + tokenJWT,
    });

    this.http
      .post(AppConstants.baseUserURL + '/saveToken/' + usuarioId, tokenFB, { headers })
      .subscribe({
        next: () => console.log('Token Firebase salvo!'),
        error: (err) => console.error('Erro ao salvar token:', err),
      });
  }

  private processarNotificacao(title: string, data: any) {
    if (title === 'Nova Corrida 🏍️') {
      const corridaId = data?.['corridaId'];
      const despachanteId = data?.['despachanteId'];

      if (corridaId) {
        localStorage.setItem('corridaId', corridaId);
        console.log('CorridaId salvo:', corridaId);
      }
      if (despachanteId) {
        localStorage.setItem('despachanteId', despachanteId);
        console.log('DespachanteId salvo:', despachanteId);
      }

      navigator.vibrate?.([1000, 500, 1000]);
      this.notificationState.mostrarTelaCorrida();
    }

    if (title === 'Corrida Perdida ❌') {
      this.notificationState.fecharTelaCorrida();
    }
  }

  escutarNotificacoes() {
    if (Capacitor.isNativePlatform()) return; // nativo já escuta via listeners

    onMessage(messaging, (payload) => {
      console.log('Mensagem recebida:', payload);
      this.processarNotificacao(payload.data?.['title'] ?? '', payload.data);
    });
  }
}