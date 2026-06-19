import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../service/usuario-service';

@Component({
  selector: 'app-meu-perfil-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-component.html',
  styleUrl: './perfil-component.css',
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  usuarioEdit: any = {};
  modalEdit = false;
  modalSucesso = false;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarPerfil();
    }
  }

  carregarPerfil() {
    this.usuarioService.getUsuarioLogado().subscribe({
      next: (data: any) => {
        this.usuario = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }

  abrirModalEdit() {
    this.usuarioEdit = { ...this.usuario };
    this.modalEdit = true;
  }

  fecharModal() {
    this.modalEdit = false;
    this.modalSucesso = false;
    this.usuarioEdit = {};
  }

  salvar() {
    this.usuarioEdit.nome = this.usuarioEdit.nome?.toUpperCase();
    this.usuarioEdit.endereco = this.usuarioEdit.endereco?.toUpperCase();
    this.usuarioEdit.email = this.usuarioEdit.email?.toUpperCase();

    this.usuarioService.putAtualizaUsuario(this.usuarioEdit).subscribe({
      next: () => {
        this.usuario = { ...this.usuarioEdit };
        this.modalEdit = false;
        this.modalSucesso = true;
        // ATUALIZA O NOME NO LOCALSTORAGE
        localStorage.setItem('nome', this.usuarioEdit.nome);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log(err),
    });
  }
}
