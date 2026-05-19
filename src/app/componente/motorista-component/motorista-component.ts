import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-motorista-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './motorista-component.html',
  styleUrl: './motorista-component.css',
})
export class MotoristaComponent implements OnInit {
  //DECLARANDO LISTA VAZIA DE USUARIO
  usuarios: User[] = [];
  modalEditStatus: boolean = false;
  usuario: User = {} as User;

  constructor(
    private usuarioservice: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.listarTodosMotorista();
  }

  listarTodosMotorista() {
    this.usuarioservice.getMotoristaList().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //CHAMA MODAL EDITAR O STATUS DO MOTORISTA
  chamarModalEdit(usuario: User) {
    this.usuario = usuario;
    this.modalEditStatus = true;
  }

  //FECHA Os MODAis
  fecharModal() {
    this.modalEditStatus = false;
    //ATUALIZA A PAGINA
    //window.location.reload();
  }

  salvarUser() {
    if (this.usuario.id) {
      this.fecharModal();
      this.usuarioservice.patchAlterarStatus(this.usuario).subscribe({
        next: (data) => {
          console.log('Alterou o usuario ID :', this.usuario.id); //
          window.location.reload();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
