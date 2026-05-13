import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../app-constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  //CAPTURANDO O TOKEN DE AUTENTICAÇÃO PARA INICIAR O SISTEMA
  login(usuario: { login: string; senha: string }) {
    return this.http.post(AppConstants.baseLogin, JSON.stringify(usuario)).subscribe(
      (data) => {
        //CORPO DO MEU RETORNO HTTP
        var tokenLogin = JSON.parse(JSON.stringify(data)).Authorization.split(' ')[1];
        localStorage.setItem('tokenAutenticacao', tokenLogin);
        //alert("Token salvo com sucesso! TOKEN: " + localStorage.getItem("tokenAutenticacao"));

        this.router.navigate(['home']);
      },
      (error) => {
        console.log('Erro ao fazer login', error);
        alert('LOGIN INVÁLIDO, POR FAVOR VERIFIQUE SUAS CREDENCIAIS!');
      },
    );
  }
}
