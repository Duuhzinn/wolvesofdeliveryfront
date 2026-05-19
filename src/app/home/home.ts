import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { UsuarioService } from '../service/usuario-service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../service/firebase-service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  //DECLARANDO LISTA VAZIA DE USUARIO
  usuarios: User[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    this.usuarioService.getMotoristaList().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
