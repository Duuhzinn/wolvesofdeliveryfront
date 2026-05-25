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

  //LISTA TODOS OS USUARIOS
  getUsuarioList(): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<any>(AppConstants.allUser, { headers });
  }

  //LISTA TODOS OS MOTORISTAS
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

  //ATUALIZA STATUS DO MOTORISTA PARA OCUPADO INICIANDO A CORRIDA
  patchOcupado(usuarioId: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.patch(AppConstants.busy(usuarioId), {}, { headers, responseType: 'text' });
  }

  //LISTA ORDEM DA FILA DOS MOTORISTAS
  getListaOrdemDafila(): Observable<any>{
    let headers = new HttpHeaders();
    if(isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<any>(AppConstants.driverQueue, {headers});
  }

  //CONSULTA O PRIMEIRO USUARIO DA LISTA DE MOTORISTA ONLINE
  getConsultaPrimeiroMotorista(): Observable<any>{
    let headers = new HttpHeaders();
    if(isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<number>(AppConstants.firstDrive, {headers})
  }

  //CRIA A CORRIDA
  postCriarCorrida(despachante: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.createRace(despachante), {}, {headers, responseType: 'text'})
  }

  //ENVIAR A NOTIFICAÇÃO PARA O MOTORISTA DA VEZ
  postEnviarNotificacao(motoristaID: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.sendDrive(motoristaID), {}, {headers, responseType: 'text'})
  }

  //EVIAR NOTIFICAÇÃO DE CORRIDA PERDIDA
  postEnviarNotificacaoPerdida(motoristaID: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.lostRace(motoristaID), {}, {headers, responseType: 'text'})
  }

  postAceitarCorrida(usuarioId: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.acceptRace(usuarioId), {}, { headers, responseType: 'text' });
  }

  


}
