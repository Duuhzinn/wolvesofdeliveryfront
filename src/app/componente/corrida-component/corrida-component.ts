import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { interval, Subscription, take, timer } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-corrida-component',
  imports: [CommonModule],
  templateUrl: './corrida-component.html',
  styleUrl: './corrida-component.css',
})
export class CorridaComponent implements OnInit {
  modalChamandoMotorista: boolean = false;
  modalSemMotorista: boolean = false;

  private timerSubscription: Subscription | null = null; //GUARDA A REFERENCIA DO TIMER PARA CANCELAR
  private stompClient: Client | null = null; // GUARDA A REFERENCIA DO WEBSOCKET PARA PODER DESCONECTAR

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.paraTudo(); //LIMPA TUDO QUANDO O USUARIO SAIR DA TELA
  }

  //CHAMA MODAL PROCURAR NOVO MOTORISTA
  chamarModalChamandoMotorista() {
    this.modalChamandoMotorista = true;
  }

  //CANCELA A CORRIDA: PARA O TIMER, DESCONECTA O WEBSOCKET E FECHA O MODAL
  cancelaCorrida() {
    this.paraTudo();
    this.modalChamandoMotorista = false;
  }

  //FECHA O MODAL
  cancelarCorrida() {
    this.paraTudo();
    this.modalChamandoMotorista = false;
  }
  fecharModalSemMotorista() {
    this.modalSemMotorista = false;
  }

  private paraTudo() {
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
    this.stompClient = new Client({
      //USA O WEBSOCKET PARA SE CONECTAR COM O BACKEND
      webSocketFactory: () => new SockJS('https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/ws'),
      onConnect: () =>{
        console.log('WebSocket conectado!');
        //ESCUTA O TÓPICO QUE O BACKEND PUBLICA QUANDO O MOTORISTA ACEITA
        this.stompClient?.subscribe('/topic/corrida', (message) =>{
          console.log('Motorista Aceitou', message.body);
          this.paraTudo(); //PARA O TIMER E DESCONECTA O WEBSOCKET
          this.modalChamandoMotorista = false; //FECHA O MODAL CHAMANDO MOTORISTA
          alert('Motorista aceitou a corrida'); //AVISA O DESPACHANTE
          this.cdr.detectChanges(); //força o angular a atualizar a tela
        });
      },
      onDisconnect: () => console.log('WebSocket desconectado'),
    });
    this.stompClient.activate(); //INICIA A CONEXÃO
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
                  this.paraTudo();
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
