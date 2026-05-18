import { Injectable } from '@angular/core';
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  async requestPermission() {
    try {
      const tokenFB = await getToken(messaging, {
        vapidKey:
          'BFt6_3dNzUiTBpx8Y38YJwrprc2tiIxHXUD1DDfG2az95n5aFPOqmINuCZ1ZrHfr3aWQlU0akPsk_qvbnHPGllo',
      });
      alert('TOKEN FB: ' + tokenFB);
    } catch (error) {
      console.error('Erro ao gerar token:', error);
    }
  }
}
