import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../service/websocket-service';
import { StatusService } from '../../service/status-service';

@Component({
  selector: 'app-motorista-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './motorista-component.html',
  styleUrl: './motorista-component.css',
})
export class MotoristaComponent implements OnInit {
  usuarios: User[] = [];
  modalEditStatus: boolean = false;
  usuario: User = {} as User;

  constructor(
    private usuarioservice: UsuarioService,
    private websocketService: WebsocketService,
    private statusService: StatusService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  get tipoUser(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('tipoUser') ?? '';
  }

  get isAdmin(): boolean { return this.tipoUser === 'ADMIN'; }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarMotoristas();

      // WEBSOCKET - ATUALIZA A LISTA QUANDO O STATUS DO MOTORISTA MUDAR
      this.websocketService.conectar(() => {
        this.carregarMotoristas();
      });
    }
  }

  carregarMotoristas() {
    if (this.isAdmin) {
      this.listarTodosMotorista();
    } else {
      const usuarioId = Number(localStorage.getItem('usuarioId'));
      this.usuarioservice.getMotoristaList().subscribe({
        next: (data) => {
          this.usuarios = data.filter((u: any) => u.id === usuarioId);
          this.cdr.detectChanges();
        },
        error: (err) => console.log(err),
      });
    }
  }

  listarTodosMotorista() {
    this.usuarioservice.getMotoristaList().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });
  }

  chamarModalEdit(usuario: User) {
    this.usuario = usuario;
    this.modalEditStatus = true;
  }

  fecharModal() {
    this.modalEditStatus = false;
    //window.location.reload();
  }

  salvarUser() {
    if (this.usuario.id) {
      this.fecharModal();
      this.usuarioservice.patchAlterarStatus(this.usuario).subscribe({
        next: (usuarioAtualizado: any) => {
          console.log('Alterou o usuario ID :', this.usuario.id);
          // ATUALIZA O STATUS VIA SERVICE SE FOR O MOTORISTA LOGADO
          const usuarioId = Number(localStorage.getItem('usuarioId'));
          if (usuarioAtualizado.id === usuarioId) {
            this.statusService.setStatus(usuarioAtualizado.status);
          }
          this.carregarMotoristas();
          this.cdr.detectChanges();
        },
        error: (err) => console.log(err),
      });
    }
  }
}