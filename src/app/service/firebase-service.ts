import { Injectable } from '@angular/core';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenFB } from '../model/tokenfb';
import { AppConstants } from '../app-constants';
import { NotificationStateService } from './notificationstate-service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private http: HttpClient,
    private notificationState: NotificationStateService
  ) {}

  async requestPermission(usuarioId: number) {
    try {
      const token = await getToken(messaging, {
        vapidKey:
          'BFt6_3dNzUiTBpx8Y38YJwrprc2tiIxHXUD1DDfG2az95n5aFPOqmINuCZ1ZrHfr3aWQlU0akPsk_qvbnHPGllo',
      });
      const tokenFB = new TokenFB();
      tokenFB.token = token;

      const tokenJWT = localStorage.getItem('tokenAutenticacao');

      const headers = new HttpHeaders({
        Authorization: 'Bearer ' + tokenJWT,
      });

      this.http
        .post(AppConstants.baseUserURL + '/saveToken/' + usuarioId, tokenFB, { headers })
        .subscribe({
          next: () => {
            console.log('Token Firebase salvo!');

            // ESCUTA NOTIFICAÇÕES
            onMessage(messaging, (payload) => {
              console.log('Mensagem recebida:', payload);

              const title = payload.data?.['title'];
              if(payload.data?.['title'] === 'Nova Corrida 🏍️'){
                // salva o corridaId no localStorage
                const corridaId = payload.data?.['corridaId'];
                if (corridaId) {
                  localStorage.setItem('corridaId', corridaId);
                  console.log('CorridaId salvo:', corridaId);
                }

                navigator.vibrate([1000, 500, 1000]);
                this.notificationState.mostrarTelaCorrida();
              }
              //alert(payload.notification?.title + '\n' + payload.notification?.body);
            });
          },

          error: (err) => {
            console.error('Erro ao salvar token:', err);
          },
        });
    } catch (error) {
      console.error('Erro ao gerar token:', error);
    }
  }
}
