import { Injectable } from '@angular/core';
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenFB } from '../model/tokenfb';
import { AppConstants } from '../app-constants';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private http: HttpClient) {}
  
  async requestPermission(usuarioId: number) {
    try {
      console.log('Iniciando requestPermission, usuarioId:', usuarioId);
      const token  = await getToken(messaging, {
        vapidKey:
          'BFt6_3dNzUiTBpx8Y38YJwrprc2tiIxHXUD1DDfG2az95n5aFPOqmINuCZ1ZrHfr3aWQlU0akPsk_qvbnHPGllo',
      });

      console.log('Token gerado:', token);
      const tokenFB = new TokenFB();
      tokenFB.token = token;

      const tokenJWT = localStorage.getItem('tokenAutenticacao');
      const headers= new HttpHeaders({ Authorization: 'Bearer ' + tokenJWT });
      this.http.post(AppConstants.baseUserURL + "/saveToken/" + usuarioId, tokenFB, { headers }).subscribe({
        next: () => {
          console.log('Token Firebase salvo!');
        },
        error: (err) => {
          console.error('Erro ao salvar token:', err);
        }

      });
      
    } catch (error) {
      console.error('Erro ao gerar token:', error);
    }
  }
}
