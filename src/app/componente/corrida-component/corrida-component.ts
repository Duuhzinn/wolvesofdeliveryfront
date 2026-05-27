import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { Subscription, take, timer } from 'rxjs';
import { Client } from '@stomp/stompjs';
import { WebsocketService } from '../../service/websocket-service';
import { NotificationStateService } from '../../service/notificationstate-service';

@Component({
  selector: 'app-corrida-component',
  imports: [CommonModule],
  templateUrl: './corrida-component.html',
  styleUrl: './corrida-component.css',
})
export class CorridaComponent implements OnInit {
  modalChamandoMotorista: boolean = false;
  modalSemMotorista: boolean = false;
  mostrarModalCorrida: boolean = false;
  private aguardandoAceite: boolean = false;

  private timerSubscription: Subscription | null = null;
  private stompClient: Client | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private notificationState: NotificationStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  corridas: any[] = [];

  get isCliente(): boolean {
    return isPlatformBrowser(this.platformId) && localStorage.getItem('tipoUser') === 'CLIENTE';
  }

  get isMotorista(): boolean {
    return isPlatformBrowser(this.platformId) && localStorage.getItem('tipoUser') === 'MOTORISTA';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCorridas();
    }
  }

  carregarCorridas() {
    const usuarioId = Number(localStorage.getItem('usuarioId'));
    const tipoUser = localStorage.getItem('tipoUser');

    if (tipoUser === 'CLIENTE') {
      this.usuarioService.getCorridasCliente(usuarioId).subscribe({
        next: (data) => { this.corridas = data; this.cdr.detectChanges(); },
        error: (err) => console.log(err),
      });
    } else if (tipoUser === 'MOTORISTA') {
      this.usuarioService.getCorridasMotorista(usuarioId).subscribe({
        next: (data) => { this.corridas = data; this.cdr.detectChanges(); },
        error: (err) => console.log(err),
      });
    } else {
      this.usuarioService.getCorridasAdm().subscribe({
        next: (data) => { this.corridas = data; this.cdr.detectChanges(); },
        error: (err) => console.log(err),
      });
    }
  }

  cancelarCorrida() {
    this.pararTudo();
    this.modalChamandoMotorista = false;
  }

  fecharModalSemMotorista() {
    this.modalSemMotorista = false;
  }

  private pararTudo() {
    this.aguardandoAceite = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  private escutaAceite() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.aguardandoAceite) return;
    this.aguardandoAceite = true;

    this.websocketService.conectarCorrida(() => {
      this.aguardandoAceite = false;
      this.pararTudo();
      this.modalChamandoMotorista = false;
      this.cdr.detectChanges();
      this.carregarCorridas();
      alert('Motorista aceitou a corrida!');
    });
  }

  chamarMotorista() {
    this.modalChamandoMotorista = true;
    this.cdr.detectChanges();

    this.usuarioService.getConsultaPrimeiroMotorista().subscribe({
      next: (motoristaId) => {
        if(motoristaId !== null){
          alert("Motorista: " + motoristaId);
          const despachante = Number(localStorage.getItem('usuarioId'));
          alert("Despachante: " + despachante);

          this.usuarioService.patchChamandoMotorista(motoristaId).subscribe({
            next: () => {
              alert("Motorista " + motoristaId + " está sendo chamado" );
              this.usuarioService.postEnviarNotificacao(motoristaId, 0).subscribe({
                next: (resp) => alert('Notificação enviada:' +  resp),
                error: (err) => console.log('Erro ao enviar notificação:', err),
              })
            }
          });
        } else {
          //alert("Sem Motorista online")
          this.modalChamandoMotorista = false;
          this.modalSemMotorista = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  atualizarCorridas(corridaId: number) {
    this.usuarioService.patchAtualizarCorrida(corridaId).subscribe({
      next: (resp) => {
        console.log('Corrida atualizada:', resp);
        this.carregarCorridas();
      },
      error: (err) => console.log('Erro ao atualizar corrida:', err),
    });
  }
}