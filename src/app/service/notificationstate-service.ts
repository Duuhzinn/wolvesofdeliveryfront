// notification-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private corridaSubject = new BehaviorSubject<boolean>(false);
  corrida$ = this.corridaSubject.asObservable();

  // AVISA O CORRIDA COMPONENT QUE HOUVE RECUSA
  private recusaSubject = new Subject<boolean>();
  recusa$ = this.recusaSubject.asObservable();

  mostrarTelaCorrida() {
    this.corridaSubject.next(true);
  }

  fecharTelaCorrida() {
    this.corridaSubject.next(false);
  }

  // NOTIFICA RECUSA
  notificarRecusa() {
    this.recusaSubject.next(true);
  }
}