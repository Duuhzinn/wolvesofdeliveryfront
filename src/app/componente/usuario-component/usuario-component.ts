import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-usuario-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-component.html',
  styleUrls: ['./usuario-component.css'],
})
export class UsuarioComponent implements OnInit {
  usuarios: User[] = [];
  nome: string = '';

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

  editar(usuario: User) {
    console.log('editar:', usuario);
    alert('editar: ' + JSON.stringify(usuario.id));
  }
}
