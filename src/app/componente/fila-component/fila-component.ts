import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { User } from '../../model/user';
import { WebsocketService } from '../../service/websocket-service';


@Component({
  selector: 'app-fila-component',
  imports: [CommonModule],
  templateUrl: './fila-component.html',
  styleUrl: './fila-component.css',
})
export class FilaComponent {

  usuario: User = {} as User;
  usuarios: User[] = [];

constructor(
  private usuarioservice: UsuarioService,
  private cdr: ChangeDetectorRef,
  private websocketService: WebsocketService,
  @Inject(PLATFORM_ID) private platformId: Object,
){

}

ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.listarOrdemDaFila();
      //CONECTA O WEBSOCKET E ATUALIZA QUANDO RECEBER A MENSAGEM
      this.websocketService.conectar(() => {
        this.listarOrdemDaFila();
      });
    }
}

  listarOrdemDaFila() {
    this.usuarioservice.getListaOrdemDafila().subscribe({
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
