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
import { Subscription, timer } from 'rxjs';
import { WebsocketService } from '../../service/websocket-service';
import { FormsModule } from '@angular/forms';
import { LocalizacaoService } from '../../service/localizacao-service';
import { LogradouroService } from '../../service/logradouro-service';

@Component({
  selector: 'app-corrida-andamento-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './corrida-andamento-component.html',
  styleUrl: './corrida-andamento-component.css',
})
export class CorridaAndamentoComponent implements OnInit, OnDestroy {
  modalChamandoMotorista: boolean = false;
  modalSemMotorista: boolean = false;
  modalEndereco: boolean = false;
  private aguardandoAceite: boolean = false;

  paginaAtual: number = 0;
  totalPaginas: number = 0;
  carregando: boolean = false;

  motoristaAtual: number | null = null;

  private timerSubscription: Subscription | null = null;

  corridas: any[] = [];

  todasRuas: any[] = [];
  sugestoes: any[] = [];
  mostrarSugestoes: boolean = false;
  indiceAtivo: number = 0;
  entregas: { rua: string; numero: string }[] = [{ rua: '', numero: '' }];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private localizacaoService: LocalizacaoService,
    private logradouroService: LogradouroService,
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

  abrirModalEndereco() {
    this.entregas = [{ rua: '', numero: '' }];
    this.sugestoes = [];
    this.mostrarSugestoes = false;
    this.modalEndereco = true;

    if (this.todasRuas.length === 0) {
      this.logradouroService.listar().subscribe({
        next: (data) => {
          this.todasRuas = data;
          this.cdr.detectChanges();
        },
      });
    }
    this.cdr.detectChanges();
  }

  fecharModalEndereco() {
    this.modalEndereco = false;
    this.entregas = [{ rua: '', numero: '' }];
    this.sugestoes = [];
    this.mostrarSugestoes = false;
    this.cdr.detectChanges();
  }

  confirmarEndereco() {
    const validas = this.entregas.filter((e) => e.rua && e.numero);
    if (validas.length === 0) return;

    // SALVA OS ENDEREÇOS PARA REUSO NO CASO DE REDESPACHO
    const enderecos = validas.map((e) => e.rua + ', ' + e.numero);
    localStorage.setItem('enderecosEntrega', JSON.stringify(enderecos));

    this.modalEndereco = false;
    this.chamarMotorista();
    this.cdr.detectChanges();
  }

  adicionarEntrega() {
    this.entregas.push({ rua: '', numero: '' });
    this.cdr.detectChanges();
  }

  removerEntrega(index: number) {
    this.entregas.splice(index, 1);
    this.cdr.detectChanges();
  }

  cancelarCorrida() {
    this.pararTudo();
    this.modalChamandoMotorista = false;

    if (this.motoristaAtual !== null) {
      const corridaIdsRaw = localStorage.getItem('corridaIds');
      const corridaIds: number[] = corridaIdsRaw ? JSON.parse(corridaIdsRaw) : [];

      if (corridaIds.length > 0) {
        this.usuarioService
          .patchCancelarChamadaMultipla(this.motoristaAtual, corridaIds)
          .subscribe();
      } else {
        this.usuarioService.patchCancelarChamada(this.motoristaAtual).subscribe();
      }
      this.motoristaAtual = null;
    }

    localStorage.removeItem('corridaIds');
    localStorage.removeItem('corridaId');
    localStorage.removeItem('enderecosEntrega');
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

  private iniciarTimer(motoristaId: number) {
    this.timerSubscription = timer(60000).subscribe({
      next: () => {
        this.usuarioService.patchMarcarOffline(motoristaId).subscribe();

        const corridaIdsRaw = localStorage.getItem('corridaIds');
        const corridaIds: number[] = corridaIdsRaw ? JSON.parse(corridaIdsRaw) : [];
        const corridaId = Number(localStorage.getItem('corridaId'));

        if (corridaIds.length > 0) {
          this.usuarioService.postEnviarNotificacaoPerdida(motoristaId, corridaIds[0]).subscribe({
            next: (resp: any) => console.log('Notificação de corrida perdida enviada:', resp),
            error: (err: any) => console.log('Erro ao enviar notificação perdida:', err),
          });
          this.usuarioService.patchExpirarCorridasMultiplas(corridaIds).subscribe({
            next: (resp: any) => console.log('Corridas expiradas!'),
            error: (err: any) => console.log('Erro ao expirar corridas:', err),
          });
        } else {
          this.usuarioService.postEnviarNotificacaoPerdida(motoristaId, corridaId).subscribe({
            next: (resp: any) => console.log('Notificação de corrida perdida enviada:', resp),
            error: (err: any) => console.log('Erro ao enviar notificação perdida:', err),
          });
          this.usuarioService.patchExpirarCorrida(corridaId).subscribe({
            next: (resp: any) => console.log('Corrida expirada!'),
            error: (err: any) => console.log('Erro ao expirar corrida:', err),
          });
        }

        // EXPIROU — LIMPA E MOSTRA MODAL SEM MOTORISTA
        localStorage.removeItem('corridaIds');
        localStorage.removeItem('corridaId');
        localStorage.removeItem('enderecosEntrega');
        this.pararTudo();
        this.modalChamandoMotorista = false;
        this.modalSemMotorista = true;
        this.cdr.detectChanges();
      },
    });
  }

  private escutarWebSocket(motoristaId: number) {
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

    // CALLBACK DE RECUSA — backend já enviou o proximoMotoristaId calculado (pulando bloqueados)
    const onRecusa = (proximoMotoristaId: number | null) => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
      }
      this.aguardandoAceite = false;

      if (proximoMotoristaId !== null) {
        this.motoristaAtual = proximoMotoristaId;
        this.escutarWebSocket(proximoMotoristaId);
        this.iniciarTimer(proximoMotoristaId);
      } else {
        this.modalChamandoMotorista = false;
        this.modalSemMotorista = true;
        this.cdr.detectChanges();
      }
    };
    this.websocketService.conectarCorrida(onAceite, onRecusa);
  }

  chamarMotorista() {
    this.modalChamandoMotorista = true;
    this.cdr.detectChanges();
    this.tentarProximoMotorista([]);
  }

  private tentarProximoMotorista(motoristasTentados: number[]) {
    this.usuarioService.getListaOrdemDafila().subscribe({
      next: (fila: any[]) => {
        const proximo = fila.find((m) => !motoristasTentados.includes(m.id));

        if (!proximo) {
          // SEM MAIS MOTORISTAS DISPONÍVEIS NA FILA
          this.modalChamandoMotorista = false;
          this.modalSemMotorista = true;
          this.cdr.detectChanges();
          return;
        }

        const motoristaId = proximo.id;
        this.motoristaAtual = motoristaId;
        const despachante = Number(localStorage.getItem('usuarioId'));

        this.usuarioService.patchChamandoMotorista(motoristaId).subscribe({
          next: () => {
            const enderecosRaw = localStorage.getItem('enderecosEntrega');
            const enderecos: string[] = enderecosRaw
              ? JSON.parse(enderecosRaw)
              : this.entregas.filter((e) => e.rua && e.numero).map((e) => e.rua + ', ' + e.numero);

            this.usuarioService
              .postEnviarNotificacaoMultipla(motoristaId, despachante, enderecos)
              .subscribe({
                next: (resp) => {
                  localStorage.setItem('corridaId', resp.corridaIds[0]);
                  localStorage.setItem('corridaIds', JSON.stringify(resp.corridaIds));
                  this.escutarWebSocket(motoristaId);
                  this.iniciarTimer(motoristaId);
                },
                error: (err) => {
                  console.log('Erro ao enviar notificação:', err);

                  if (err.status === 400) {
                    // BLOQUEADO PARA ESSE ESTABELECIMENTO — TENTA O PRÓXIMO, SEM MUDAR O STATUS DELE
                    this.usuarioService.patchCancelarChamada(motoristaId).subscribe(); // volta ele pro status online (já que patchChamandoMotorista o marcou como status 3)
                    this.tentarProximoMotorista([...motoristasTentados, motoristaId]);
                  } else {
                    this.modalChamandoMotorista = false;
                    this.modalSemMotorista = true;
                    this.cdr.detectChanges();
                  }
                },
              });
          },
        });
      },
    });
  }

  atualizarCorridas(corridaId: number) {
    this.usuarioService.patchAtualizarCorrida(corridaId).subscribe({
      next: (resp) => {
        console.log('Corrida atualizada:', resp);
        this.localizacaoService.pararEnvioLocalizacao();
        this.paginaAtual = 0;
        this.corridas = [];
        this.carregarCorridas();
      },
      error: (err) => console.log('Erro ao atualizar corrida:', err),
    });
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  onFocarEndereco(index: number) {
    this.indiceAtivo = index;
    if (this.entregas[index].rua.length === 0) {
      this.mostrarSugestoes = false;
      return;
    }
    this.sugestoes = this.todasRuas.filter(
      (r, i, arr) => arr.findIndex((x) => x.rua === r.rua) === i,
    );
    this.mostrarSugestoes = this.sugestoes.length > 0;
    this.cdr.detectChanges();
  }

  //BUSCANDO O ENDEREÇO DIGITADO
  onDigitarEndereco(valor: string, index: number) {
    this.indiceAtivo = index;
    this.entregas[index].rua = valor.toUpperCase();

    if (valor.length === 0) {
      this.sugestoes = [];
      this.mostrarSugestoes = false;
      this.cdr.detectChanges();
      return;
    }

    const filtradas = this.todasRuas.filter((r) =>
      r.rua.toUpperCase().includes(this.entregas[index].rua),
    );

    this.sugestoes = filtradas.filter((r, i, arr) => arr.findIndex((x) => x.rua === r.rua) === i);
    this.mostrarSugestoes = this.sugestoes.length > 0;
    this.cdr.detectChanges();
  }

  selecionarLogradouro(logradouro: any) {
    this.entregas[this.indiceAtivo].rua = logradouro.rua.toUpperCase();
    this.sugestoes = [];
    this.mostrarSugestoes = false;
    this.cdr.detectChanges();
  }

  fecharSugestoes() {
    setTimeout(() => {
      this.mostrarSugestoes = false;
      this.cdr.detectChanges();
    }, 200);
  }
}
