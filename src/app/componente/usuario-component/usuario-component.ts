import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { User } from '../../model/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-component.html',
  styleUrls: ['./usuario-component.css'],
})
export class UsuarioComponent implements OnInit {
  usuarios: User[] = [];

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

  editar(usuario: User) {
    console.log('editar:', usuario);
    alert('editar: ' + JSON.stringify(usuario.id));
  }
}
