import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../app-constants';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase-service';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  //CAPTURANDO O TOKEN DE AUTENTICAÇÃO PARA INICIAR O SISTEMA
  login(usuario: { login: string; senha: string }) {
    return this.http.post(AppConstants.baseLogin, JSON.stringify(usuario)).subscribe(
      (data) => {
        //CORPO DO MEU RETORNO HTTP
        var tokenLogin = JSON.parse(JSON.stringify(data)).Authorization.split(' ')[1];
        localStorage.setItem('tokenAutenticacao', tokenLogin); //SALVA O JWT NO LOCALSTORAGE
        //alert("Token salvo com sucesso! TOKEN: " + localStorage.getItem("tokenAutenticacao"));

        //CAPTURANDO O USUARIO LOGADO
        const headers = new HttpHeaders({ Authorization: 'Bearer ' + tokenLogin });
        this.http.get<User>(AppConstants.usuarioLogado(), { headers })
          .subscribe((usuarioLogado) => {
            console.log('Usuario logado:', usuarioLogado);
            localStorage.setItem('usuarioId', usuarioLogado.id.toString());
            localStorage.setItem('tipoUser', usuarioLogado.tipoUser);
            //SALVANDO O TOKEN COM USUARIO LOGADO NO BANCO
            this.firebaseService.requestPermission(usuarioLogado.id);
            this.router.navigate(['home']);
          });

      },
      (error) => {
        console.log('Erro ao fazer login', error);
        alert('LOGIN INVÁLIDO, POR FAVOR VERIFIQUE SUAS CREDENCIAIS!');
      },
    );
  }
}
