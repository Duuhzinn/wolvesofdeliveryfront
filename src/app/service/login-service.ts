import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../app-constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private http: HttpClient, private router: Router) { }

  login(usuario: any) {
    // O Angular já entende que 'usuario' é um objeto e envia como JSON
    return this.http.post(AppConstants.baseLogin, usuario).subscribe({
      next: (data: any) => {
        // Acessando o token com segurança
        if (data && data.Authorization) {
          const token = data.Authorization.split(' ')[1];
          localStorage.setItem("tokenAutenticacao", token);

          console.log("Token salvo com sucesso!");
          this.router.navigate(['home']);
        } else {
          console.error("Estrutura de resposta inesperada:", data);
          alert("Erro: O servidor não retornou o token de autorização.");
        }
      },
      error: (err) => {
        console.error("Erro detalhado do servidor:", err);
        // Se o erro for 403, o 'err.status' será 403
        if (err.status === 403) {
          alert("Acesso Negado (403): Usuário ou senha incorretos ou problema de permissão no servidor.");
        } else {
          alert("Ocorreu um erro ao tentar logar. Verifique sua conexão.");
        }
      }
    }); // Chave e parêntese fechados corretamente agora
  }
}