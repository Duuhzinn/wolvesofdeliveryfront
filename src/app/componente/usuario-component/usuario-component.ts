import { Component, afterNextRender } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.css',
})
export class UsuarioComponent {
  usuarios: User[] = [];

  constructor(private usuarioService: UsuarioService) {
    afterNextRender(() => {
      this.usuarioService.getUsuarioList().subscribe((data) => {
        this.usuarios = data;
      });
    });
  }

  editar(usuario: User) {
    console.log('editar:', usuario);
    alert('editar: ' + JSON.stringify(usuario.id));
  }
}
