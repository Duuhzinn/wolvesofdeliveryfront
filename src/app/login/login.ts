import { Component, OnInit } from '@angular/core';
import { LoginService } from '../service/login-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  providers: [LoginService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  usuario = { login: '', senha: '' };
  lembrarMe: boolean = false;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    // CARREGA AS CREDENCIAIS SALVAS SE EXISTIREM
    const loginSalvo = localStorage.getItem('savedLogin');
    const senhaSalva = localStorage.getItem('savedSenha');
    if (loginSalvo && senhaSalva) {
      this.usuario.login = loginSalvo;
      this.usuario.senha = senhaSalva;
      this.lembrarMe = true;
    }
  }

  public login() {
    if (this.lembrarMe) {
      // SALVA AS CREDENCIAIS
      localStorage.setItem('savedLogin', this.usuario.login);
      localStorage.setItem('savedSenha', this.usuario.senha);
    } else {
      // REMOVE AS CREDENCIAIS SALVAS
      localStorage.removeItem('savedLogin');
      localStorage.removeItem('savedSenha');
    }
    this.loginService.login(this.usuario);
  }
}