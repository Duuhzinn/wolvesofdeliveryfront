import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-component.html',
  styleUrls: ['./usuario-component.css'],
})
export class UsuarioComponent implements OnInit {
  usuario: User = {} as User;
  usuarios: User[] = [];
  nome: string = '';
  modalInsertEdit: boolean = false;
  modalSucess: boolean = false;
  modalErro: Boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.usuarioService.getUsuarioList().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }


  //CONSULTA O NOME DO USUARIO RETORNANDO TODAS AS INFORMAÇÕES NA TABELA
  consultarUserNome(): void {
    this.usuarioService.getConsultaUserNome(this.nome).subscribe({
      next: (data) => {
        console.log('Retorno:', data); // ← aqui
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //CHAMA MODAL PARA CADASTRAR NOVO USUARIO
  chamarModalNovo() {
    this.modalInsertEdit = true;
  }

  //CHAMA MODAL COM AS INFORMAÇÕES DO USUARIO PARA EDIÇÃO
  chamarModalEdit(id: any) {
    this.modalInsertEdit = true;

    const idUser = this.usuarios.find((u) => u.id === id);
    if (idUser) {
      this.usuario = { ...idUser };
    }
  }
  //FECHA Os MODAis
  fecharModal() {
    this.modalInsertEdit = false;
    //LIMPA TODOS OS CAMPOS DA TABELA
    this.usuario = {} as User;
    this.modalSucess = false;
    this.modalErro = false;
  }

  abrirModalSucesso(){
    this.modalSucess = true;
  }

  //SALVA O USUARIO DEPOIS DE INSERIDO OU EDITADO
  salvarUser() {
    if (this.usuario.id) {
      //ENCONTRA A POSICAO (ID) DO USUARIO NA LISTA ORIGINAL
      const index = this.usuarios.findIndex((u) => u.id === this.usuario.id);

      if (index !== -1) {
        //SUBSTITUI O USUARIO NAQUELA POSICAO PELOS DADOS NOVOS DO FORMULARIO
        //USANDO O {...} PARA GARANTIR QUE ESTAMOS PASSANDO UM OBJETO NOVO E LIMPO
        this.usuarios[index] = { ...this.usuario };
        alert(this.usuario.id);

        this.modalInsertEdit = false;
        this.modalSucess = true;
      }
    } else {
      this.usuario.nome = this.usuario.nome?.toUpperCase();
      this.usuario.endereco = this.usuario.endereco?.toUpperCase();
      this.usuario.email = this.usuario.email?.toUpperCase();
      this.usuario.status = 0;

      this.usuarioService.salvarNovoUsuario(this.usuario).subscribe({
        next: (data) => {
          this.modalInsertEdit = false;
          this.usuario = {} as User;
          this.abrirModalSucesso();
        },
      });
    }
  }
}
