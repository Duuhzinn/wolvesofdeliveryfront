import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { interval, Subscription, take, timer } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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

  private timerSubscription: Subscription | null = null; //GUARDA A REFERENCIA DO TIMER PARA CANCELAR
  private stompClient: Client | null = null; // GUARDA A REFERENCIA DO WEBSOCKET PARA PODER DESCONECTAR

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private notificationState: NotificationStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.pararTudo(); //LIMPA TUDO QUANDO O USUARIO SAIR DA TELA

  }

  //FECHA O MODAL
  cancelarCorrida() {
    this.pararTudo();
    this.modalChamandoMotorista = false;
  }
  fecharModalSemMotorista() {
    this.modalSemMotorista = false;
  }

  private pararTudo() {
    //PARA O TIMER DA CHAMADA DE MOTORISTA
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    if(this.stompClient){
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  //CONECTA O WEBSOCKET E FICA ESCUTANDO O ACEITE DO MOTORISTA
  private escutaAceite(){
    if(isPlatformBrowser(this.platformId)){
      this.websocketService.conectarCorrida(() => {
        alert('Motorista aceitou a corrida!');
        this.pararTudo();
        //this.modalChamandoMotorista = false;
         //ALTERA STATUS PARA OCUPADO
          const motoristaId = localStorage.getItem('usuarioId');

      })
    }
  }

  chamarMotorista() {
    this.usuarioService.getConsultaPrimeiroMotorista().subscribe({
      next: (motoristaID) => {
        if (motoristaID !== null) {
          console.log('ID do motorista encontrado: ' + motoristaID);
          alert('Procurando Motorista...');
          //this.modalChamandoMotorista = true;//ABRE O MODAL CHAMANDO MOTORISTA
          this.escutaAceite();//INICIA A ESCUTA DO WEBSOCKET

          //DISPARA IMEDIATAMENTE A CADA 7 SEGUNDOS DURANTE 9X
          this.timerSubscription = timer(0, 7000).pipe(take(9)).subscribe({
              next: (index) => {
                if (index < 8) {
                  this.usuarioService.postEnviarNotificacao(motoristaID).subscribe({
                    next: (resp) => console.log('Notificação enviada:', resp),
                    error: (err) => console.log('Erro ao enviar notificação:', err),
                  });
                } else {
                  // nona execução (index === 8) — ação final aqui!
                  console.log('9 tentativas concluídas...');
                  //DISPARA A NOTIFICAÇÃO DE CORRIDA PERDIDA
                  this.usuarioService.postEnviarNotificacaoPerdida(motoristaID).subscribe({
                    next: (resp) => console.log('Notificação enviada: ', resp ),
                    error: (err) => console.log('Erro ao enviar notificação', err),
                  });
                  this.pararTudo();
                  //this.modalChamandoMotorista = false;
                  //this.modalSemMotorista = true;
                  //this.cdr.detectChanges();  
                  alert('Sem Motorista')
                }
              },
            });
        } else {
          alert('Estamos sem Motorista no momento, por favor aguarde!!!');
          //this.modalSemMotorista = true;
          //this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
