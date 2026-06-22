import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LoginService } from '../service/login-service';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

  constructor(
    private loginService: LoginService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // CARREGA AS CREDENCIAIS SALVAS SE EXISTIREM
      const loginSalvo = localStorage.getItem('savedLogin');
      const senhaSalva = localStorage.getItem('savedSenha');
      if (loginSalvo && senhaSalva) {
        this.usuario.login = loginSalvo;
        try {
          this.usuario.senha = atob(senhaSalva);
        } catch {
          this.usuario.senha = senhaSalva; // FALLBACK PRA SENHA ANTIGA
          localStorage.setItem('savedSenha', btoa(senhaSalva)); // MIGRA PRA BASE64
        }
        this.lembrarMe = true;
      }
    }
  }

  public login() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.lembrarMe) {
        localStorage.setItem('savedLogin', this.usuario.login);
        localStorage.setItem('savedSenha', btoa(this.usuario.senha));
      } else {
        localStorage.removeItem('savedLogin');
        localStorage.removeItem('savedSenha');
      }
    }
    this.loginService.login(this.usuario); // ✅ FORA do if
  }
}
