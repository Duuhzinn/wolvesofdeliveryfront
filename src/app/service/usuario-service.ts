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
  getConsultaUserNome(nome: String, tipoUser: string): Observable<any> {
    const url = AppConstants.pesqUserNome(nome, tipoUser);
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    return this.http.get<any>(AppConstants.pesqUserNome(nome, tipoUser), { headers });
  }

  //INSERI NOVO USUARIO NO BANCO
  postSalvarNovoUsuario(user: User): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<any>(AppConstants.salvarUsuario(), user, { headers });
  }

  //ATUALIZA USUARIO POR NOME
  putAtualizaUsuario(user: User): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<any>(AppConstants.atualizarUsuario(), user, { headers });
  }

  //ATUALIZA O STATUS DO USUARIO POR ID
  patchAlterarStatus(user: User): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch<any>(AppConstants.changeStatus(user.id), user, { headers });
  }

  //ATUALIZA STATUS DO MOTORISTA PARA OCUPADO INICIANDO A CORRIDA
  patchOcupado(usuarioId: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.busy(usuarioId), {}, { headers, responseType: 'text' });
  }

  //LISTA ORDEM DA FILA DOS MOTORISTAS
  getListaOrdemDafila(): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<any>(AppConstants.driverQueue, { headers });
  }

  //CONSULTA O PRIMEIRO USUARIO DA LISTA DE MOTORISTA ONLINE
  getConsultaPrimeiroMotorista(): Observable<any> {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('tokenAutenticacao');
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.get<number>(AppConstants.firstDrive, { headers });
  }

  //CRIA A CORRIDA
  postCriarCorrida(despachante: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<any>(AppConstants.createRace(despachante), {}, { headers });
  }

  //ENVIAR A NOTIFICAÇÃO PARA O MOTORISTA DA VEZ
  postEnviarNotificacao(motoristaID: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(
      AppConstants.sendDrive(motoristaID),
      {},
      { headers, responseType: 'text' },
    );
  }

  //CHAMANDO O MOTORISTA DA VEZ
  patchChamandoMotorista(motoristaId: number): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.callingDrive(motoristaId), {}, { headers, responseType: 'text'});
  }

  //EVIAR NOTIFICAÇÃO DE CORRIDA PERDIDA
  postEnviarNotificacaoPerdida(motoristaID: number, corridaID: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(
      AppConstants.lostRace(motoristaID, corridaID),
      {},
      { headers, responseType: 'text' },
    );
  }

  //ACEITE DO MOTORISTA NAS CORRIDAS NOTIFICADAS
  postAceitarCorrida(motoristaId: number, usuarioId: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(
      AppConstants.acceptRace(motoristaId, usuarioId),
      {},
      { headers, responseType: 'text' },
    );
  }

  //ALTERA O STATUS DO MOTORISTA PARA OFFLINE
  patchMarcarOffline(motoristaId: number): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.signoffline(motoristaId), {}, { headers, responseType: 'text' });
  }

  //LISTA TODAS AS CORRIDAS DOS CLIENTES
  getCorridasCliente(clienteId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.raceDespatcher(clienteId), { headers });
  }

  //LISTA TODAS AS CORRIDAS DOS CLIENTES
  getCorridasMotorista(motoristaId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.raceDrive(motoristaId), { headers });
  }
  //ATUALIZA TODAS AS CORRIDAS PARA OS ADM
  getCorridasAdm(): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.allRace(), { headers });
  }

  //ATUALIZA AS CORRIDAS
  patchAtualizarCorrida(corridaId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.updateRace(corridaId), {}, { headers, responseType: 'text' });
  }

}
