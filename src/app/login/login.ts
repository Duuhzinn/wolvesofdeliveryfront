import { Component, OnInit } from '@angular/core';
import { LoginService } from '../service/login-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  providers: [LoginService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  usuario = { login: '', senha: '' };
  
    constructor(private loginService: LoginService) {}
  
    public login() {
      this.loginService.login(this.usuario);
    }

    ngOnInit(): void {
      
    }
  
}
