// notification-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private corridaSubject = new BehaviorSubject<boolean>(false);
  corrida$ = this.corridaSubject.asObservable();

  mostrarTelaCorrida() {
    this.corridaSubject.next(true);
  }

  fecharTelaCorrida() {
    this.corridaSubject.next(false);
  }
}