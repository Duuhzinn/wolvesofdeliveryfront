import { CommonModule, isPlatformBrowser } from '@angular/common';
import {ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID,} from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { Subscription, take, timer } from 'rxjs';
import { WebsocketService } from '../../service/websocket-service';
import { ActivatedRoute } from '@angular/router';

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
  statusCorrida: string = 'andamento';

  // PAGINAÇÃO - CONTROLE DAS PÁGINAS
  paginaAtual: number = 0; // PÁGINA ATUAL (COMEÇA NA 0)
  totalPaginas: number = 0; // TOTAL DE PÁGINAS QUE O BACKEND RETORNOU
  carregando: boolean = false; // EVITA CHAMAR DUAS VEZES AO MESMO TEMPO

  private timerSubscription: Subscription | null = null;

  corridas: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
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
      this.route.paramMap.subscribe((params) => {
        this.statusCorrida = params.get('status') ?? 'andamento';
        this.paginaAtual = 0; // PAGINAÇÃO - RESETA A PÁGINA AO TROCAR DE ROTA
        this.corridas = []; // PAGINAÇÃO - LIMPA A LISTA AO TROCAR DE ROTA
        this.carregarCorridas();
      });
    }
  }

  // PAGINAÇÃO - DETECTA QUANDO O USUÁRIO CHEGOU NO FIM DA PÁGINA
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const posicaoAtual = window.innerHeight + window.scrollY; // POSIÇÃO ATUAL DA TELA
    const alturaTotal = document.body.offsetHeight; // ALTURA TOTAL DA PÁGINA

    // SE CHEGOU PERTO DO FIM (100px) E NÃO ESTÁ CARREGANDO E AINDA TEM PÁGINAS
    if (
      posicaoAtual >= alturaTotal - 100 &&
      !this.carregando &&
      this.paginaAtual < this.totalPaginas - 1
    ) {
      this.paginaAtual++; // PAGINAÇÃO - AVANÇA PARA A PRÓXIMA PÁGINA
      this.carregarCorridas();
    }
  }

  carregarCorridas() {
    if (this.carregando) return; // PAGINAÇÃO - SE JÁ ESTÁ CARREGANDO, IGNORA
    this.carregando = true; // PAGINAÇÃO - MARCA QUE ESTÁ CARREGANDO

    const usuarioId = Number(localStorage.getItem('usuarioId'));
    const tipoUser = localStorage.getItem('tipoUser');
    const finalizada = this.statusCorrida === 'finalizada';

    // PAGINAÇÃO - FUNÇÃO QUE PROCESSA O RETORNO DO BACKEND
    const next = (data: any) => {
      this.corridas = [...this.corridas, ...data.content]; // PAGINAÇÃO - ACUMULA AS CORRIDAS SEM APAGAR AS ANTERIORES
      this.totalPaginas = data.totalPages; // PAGINAÇÃO - SALVA O TOTAL DE PÁGINAS
      this.carregando = false; // PAGINAÇÃO - LIBERA PARA CARREGAR MAIS
      this.cdr.detectChanges();
    };
    const error = (err: any) => {
      console.log(err);
      this.carregando = false; // PAGINAÇÃO - LIBERA MESMO SE DEU ERRO
    };

    if (tipoUser === 'CLIENTE') {
      if (finalizada) {
        this.usuarioService
          .getCorridasClienteFinalizadas(usuarioId, this.paginaAtual)
          .subscribe({ next, error });
      } else {
        this.usuarioService
          .getCorridasClienteAndamento(usuarioId, this.paginaAtual)
          .subscribe({ next, error });
      }
    } else if (tipoUser === 'MOTORISTA') {
      if (finalizada) {
        this.usuarioService
          .getCorridasMotoristaFinalizadas(usuarioId, this.paginaAtual)
          .subscribe({ next, error });
      } else {
        this.usuarioService
          .getCorridasMotoristaAndamento(usuarioId, this.paginaAtual)
          .subscribe({ next, error });
      }
    } else {
      if (finalizada) {
        this.usuarioService.getCorridasAdmFinalizadas(this.paginaAtual).subscribe({ next, error });
      } else {
        this.usuarioService.getCorridasAdmAndamento(this.paginaAtual).subscribe({ next, error });
      }
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
    this.websocketService.desconectarCorrida(); // DESCONECTA O WEBSOCKET CORRETAMENTE
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
      this.paginaAtual = 0; // PAGINAÇÃO - RESETA AO ACEITAR CORRIDA
      this.corridas = []; // PAGINAÇÃO - LIMPA A LISTA AO ACEITAR CORRIDA
      this.carregarCorridas();
      //alert('Motorista aceitou a corrida!');
    });
  }

  chamarMotorista() {
    this.modalChamandoMotorista = true;
    this.cdr.detectChanges();

    this.usuarioService.getConsultaPrimeiroMotorista().subscribe({
      next: (motoristaId) => {
        if (motoristaId !== null) {
          const despachante = Number(localStorage.getItem('usuarioId'));

          this.usuarioService.patchChamandoMotorista(motoristaId).subscribe({
            next: () => {
              console.log('Motorista marcado como chamando:', motoristaId);
              console.log('Despachante:', despachante);

              this.usuarioService.postEnviarNotificacao(motoristaId, despachante).subscribe({
                next: (resp) => {
                  //alert('Notificação enviada:' + resp);
                  this.escutaAceite();

                  this.timerSubscription = timer(7000, 7000)
                    .pipe(take(8))
                    .subscribe({
                      next: (index) => {
                        console.log('Timer index:', index);
                        this.usuarioService
                          .postEnviarNotificacao(motoristaId, despachante)
                          .subscribe({
                            next: (resp) => console.log('Renotificação enviada:', resp),
                            error: (err) => console.log('Erro:', err),
                          });
                      },
                      complete: () => {
                        console.log('9 tentativas concluídas');
                        this.usuarioService.patchMarcarOffline(motoristaId).subscribe();

                        //NOTIFICA O MOTORISTA QUE ELE PERDEU A CORRIDA
                        const corridaId = Number(localStorage.getItem('corridaId'));
                        this.usuarioService
                          .postEnviarNotificacaoPerdida(motoristaId, corridaId)
                          .subscribe({
                            next: (resp) =>
                              console.log('Notificação de corrida perdida enviada:', resp),
                            error: (err) => console.log('Erro ao enviar notificação perdida:', err),
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
        this.paginaAtual = 0; // PAGINAÇÃO - RESETA AO ATUALIZAR CORRIDA
        this.corridas = []; // PAGINAÇÃO - LIMPA A LISTA AO ATUALIZAR CORRIDA
        this.carregarCorridas();
      },
      error: (err) => console.log('Erro ao atualizar corrida:', err),
    });
  }
}
