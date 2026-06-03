import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { NotificationStateService } from '../../service/notificationstate-service';
import { UsuarioService } from '../../service/usuario-service';
import { Subscription, take, timer } from 'rxjs';
import { WebsocketService } from '../../service/websocket-service';

@Component({
  selector: 'app-corrida-andamento-component',
  imports: [CommonModule],
  templateUrl: './corrida-andamento-component.html',
  styleUrl: './corrida-andamento-component.css',
})
export class CorridaAndamentoComponent implements OnInit, OnDestroy {
  modalChamandoMotorista: boolean = false;
  modalSemMotorista: boolean = false;
  private aguardandoAceite: boolean = false;

  paginaAtual: number = 0;
  totalPaginas: number = 0;
  carregando: boolean = false;

  motoristaAtual: number | null = null;

  private timerSubscription: Subscription | null = null;

  corridas: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private notificationState: NotificationStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get isCliente(): boolean {
    return isPlatformBrowser(this.platformId) && localStorage.getItem('tipoUser') === 'CLIENTE';
  }

  get isMotorista(): boolean {
    return isPlatformBrowser(this.platformId) && localStorage.getItem('tipoUser') === 'MOTORISTA';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCorridas();
      this.websocketService.conectarAtualizacao(() => {
        setTimeout(() => {
          this.paginaAtual = 0;
          this.corridas = [];
          this.carregarCorridas();
          this.cdr.detectChanges();
        }, 0);
      });
    }
  }

  ngOnDestroy(): void {
    this.pararTudo();
    this.websocketService.desconectarAtualizacao();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const posicaoAtual = window.innerHeight + window.scrollY;
    const alturaTotal = document.body.offsetHeight;

    if (
      posicaoAtual >= alturaTotal - 100 &&
      !this.carregando &&
      this.paginaAtual < this.totalPaginas - 1
    ) {
      this.paginaAtual++;
      this.carregarCorridas();
    }
  }

  carregarCorridas() {
    if (this.carregando) return;
    if (!isPlatformBrowser(this.platformId)) return;
    this.carregando = true;

    const usuarioId = Number(localStorage.getItem('usuarioId'));
    const tipoUser = localStorage.getItem('tipoUser');

    if (!tipoUser || !usuarioId) {
      this.carregando = false;
      return;
    }

    const next = (data: any) => {
      this.corridas = [...this.corridas, ...data.content];
      this.totalPaginas = data.totalPages;
      this.carregando = false;
      this.cdr.detectChanges();
    };
    const error = (err: any) => {
      console.log(err);
      this.carregando = false;
    };

    if (tipoUser === 'CLIENTE') {
      this.usuarioService
        .getCorridasClienteAndamento(usuarioId, this.paginaAtual)
        .subscribe({ next, error });
    } else if (tipoUser === 'MOTORISTA') {
      this.usuarioService
        .getCorridasMotoristaAndamento(usuarioId, this.paginaAtual)
        .subscribe({ next, error });
    } else {
      this.usuarioService.getCorridasAdmAndamento(this.paginaAtual).subscribe({ next, error });
    }
  }

  cancelarCorrida() {
    this.pararTudo();
    this.modalChamandoMotorista = false;

    if(this.motoristaAtual !== null){
      this.usuarioService.patchCancelarChamada(this.motoristaAtual).subscribe();
      this.motoristaAtual = null
    }
  }

  fecharModalSemMotorista() {
    this.modalSemMotorista = false;
    this.cdr.detectChanges();
  }

  private pararTudo() {
    this.aguardandoAceite = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.websocketService.desconectarCorrida();
  }

  private escutarWebSocket() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.aguardandoAceite) return;
    this.aguardandoAceite = true;

    // CALLBACK DE ACEITE
    const onAceite = () => {
      setTimeout(() => {
        this.aguardandoAceite = false;
        this.pararTudo();
        this.modalChamandoMotorista = false;
        this.paginaAtual = 0;
        this.corridas = [];
        this.carregarCorridas();
        this.cdr.detectChanges();
      }, 0);
    };

    // CALLBACK DE RECUSA
    const onRecusa = () => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
      }
      this.aguardandoAceite = false;
      this.chamarMotorista();
    };

    this.websocketService.conectarCorrida(onAceite, onRecusa);
  }

  
  chamarMotorista() {
    this.modalChamandoMotorista = true;
    this.cdr.detectChanges();

    this.usuarioService.getConsultaPrimeiroMotorista().subscribe({
      next: (motoristaId) => {
        if (motoristaId !== null) {
          this.motoristaAtual = motoristaId //SALVA O MOTORISTA ATUAL NA VARIAVEL
          const despachante = Number(localStorage.getItem('usuarioId'));

          this.usuarioService.patchChamandoMotorista(motoristaId).subscribe({
            next: () => {
              this.usuarioService.postEnviarNotificacao(motoristaId, despachante).subscribe({
                next: (resp) => {
                  //alert('Notificação enviada');
                  localStorage.setItem('corridaId', resp.corridaId);
                  this.escutarWebSocket();

                  // AGUARDA 1 MINUTO SEM RENOTIFICAR
                  this.timerSubscription = timer(60000).subscribe({
                    next: () => {
                      this.usuarioService.patchMarcarOffline(motoristaId).subscribe();
                      const corridaId = Number(localStorage.getItem('corridaId'));
                      
                      //ENVIAR A NOTIFICACAO DE CORRIDA PERDIDA E EXPIRA A CORRIDA
                      this.usuarioService.postEnviarNotificacaoPerdida(motoristaId, corridaId).subscribe({
                         next: (resp: any) => console.log('Notificação de corrida perdida enviada:', resp),
                         error: (err: any) => console.log('Erro ao enviar notificação perdida:', err),
                      });
                      
                      //EXPIRA A DORRIDA
                      this.usuarioService.patchExpirarCorrida(corridaId).subscribe({
                        next: (resp: any) => console.log('Corrida expirada!'),
                        error: (err: any) => console.log('Erro ao expirar corrida:', err),
                      });

                      this.pararTudo();
                      this.chamarMotorista();
                    },
                  });
                },
                error: (err) => console.log('Erro ao enviar notificação:', err),
              });
            },
          });
        } else {
          //alert("Sem Motorista online")
          this.modalChamandoMotorista = false;
          this.modalSemMotorista = true;
          this.cdr.detectChanges();
        }
      },
    });
  }

  atualizarCorridas(corridaId: number) {
    this.usuarioService.patchAtualizarCorrida(corridaId).subscribe({
      next: (resp) => {
        console.log('Corrida atualizada:', resp);
        this.paginaAtual = 0;
        this.corridas = [];
        this.carregarCorridas();
      },
      error: (err) => console.log('Erro ao atualizar corrida:', err),
    });
  }
}
