import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { AppConstants } from '../app-constants';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  //CONSULTA TODOS OS USUARIOS
  getUsuarioList(): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<any>(AppConstants.allUser, { headers });
  }

  //CONSULTA TODOS OS MOTORISTAS
  getMotoristaList(): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<any>(AppConstants.allDrive, { headers });
  }

  //CONSULTA USUARIO POR NOME
  getConsultaUserNome(nome: String): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    return this.http.get<any>(AppConstants.pesqUserNome(nome), { headers });
  }

  //INSERI NOVO USUARIO NO BANCO
  postSalvarNovoUsuario(user: User): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.post<any>(AppConstants.salvarUsuario(), user, { headers });
  }

  //ATUALIZA USUARIO POR NOME
  putAtualizaUsuario( user: User): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.put<any>(AppConstants.atualizarUsuario(), user, {headers})
  }

  //ATUALIZA O STATUS DO USUARIO POR ID
  patchAlterarStatus(user: User): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.patch<any>(AppConstants.changeStatus(user.id), user, {headers})
  }
  
}
