import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';
import { interval, take, timer } from 'rxjs';

@Component({
  selector: 'app-corrida-component',
  imports: [CommonModule],
  templateUrl: './corrida-component.html',
  styleUrl: './corrida-component.css',
})
export class CorridaComponent implements OnInit {
  modalChamandoMotorista: boolean = false;
  modalSemMotorista: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  //CHAMA MODAL PROCURAR NOVO MOTORISTA
  chamarModalChamandoMotorista() {
    this.modalChamandoMotorista = true;
  }

  //FECHA O MODAL
  cancelarCorrida() {
    this.modalChamandoMotorista = false;
  }
  fecharModalSemMotorista() {
    this.modalSemMotorista = false;
  }

  chamarMotorista() {
    this.usuarioService.getConsultaPrimeiroMotorista().subscribe({
      next: (data) => {
        if (data !== null) {
          console.log('ID: ' + data);
          alert('Procurando Motorista...');

          //DISPARA IMEDIATAMENTE E DEPOIS A CADA 10S POR 5X (1 MINUTO)
          timer(0, 7000).pipe(take(9)).subscribe({
              next: (index) => {
                if (index < 8) {
                  this.usuarioService.postEnviarNotificacao(data).subscribe({
                    next: (resp) => console.log('Notificação enviada:', resp),
                    error: (err) => console.log('Erro ao enviar notificação:', err),
                  });
                } else {
                  // nona execução (index === 8) — ação final aqui!
                  console.log('9 tentativas concluídas...');
                }
              },
            });
        } else {
          alert('Estamos sem Motorista no momento, por favor aguarde!!!');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
