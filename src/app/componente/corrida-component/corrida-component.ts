import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/usuario-service';

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
          alert('ID: ' + data);
          this.usuarioService.postEnviarNotificacao(data).subscribe({
            next: (resp) => {
              console.log('Notificação enviada:', resp)
              this.chamarModalChamandoMotorista();
            },
            error: (err) => {
              console.log('Erro ao enviar notificação:', err);
            }
          })
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
