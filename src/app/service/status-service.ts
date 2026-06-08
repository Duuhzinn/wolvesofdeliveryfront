import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatusService {
  // SUBJECT QUE GUARDA O STATUS ATUAL DO MOTORISTA
  private statusSubject = new BehaviorSubject<number>(0);
  status$ = this.statusSubject.asObservable();

  setStatus(status: number) {
    localStorage.setItem('statusMotorista', status.toString());
    this.statusSubject.next(status);
  }

  getStatus(): number {
    return this.statusSubject.getValue();
  }
}