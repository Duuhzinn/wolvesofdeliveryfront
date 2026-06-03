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

  postEnviarNotificacao(motoristaID: number, despachanteId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.sendDrive(motoristaID, despachanteId), {}, { headers });
  }

  //CHAMANDO O MOTORISTA DA VEZ
  patchChamandoMotorista(motoristaId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.callingDrive(motoristaId), {}, { headers, responseType: 'text' },
    );
  }

  //EVIAR NOTIFICAÇÃO DE CORRIDA PERDIDA
  postEnviarNotificacaoPerdida(motoristaID: number, corridaID: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(AppConstants.lostRace(motoristaID, corridaID), {},{ headers, responseType: 'text' },
    );
  }

  //EXPIRA A CORRIDA MARCADO-A COMO CANCELADA
  patchExpirarCorrida(corridaID: number): Observable<string>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.expireRace(corridaID), {}, { headers, responseType: 'text' }
    );
  }

  //ACEITE DO MOTORISTA NAS CORRIDAS NOTIFICADAS
  patchAceitarCorrida(corridaId: number): Observable<string> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.acceptRace(corridaId), {},{ headers, responseType: 'text' },
    );
  }

  //RECUSA DO MOTORISTA NA CORRIDA NOTIFICADA
  patchRecusarCorrida(motoristaId: number, corridaId: number, despachante: number){  
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.recusarCorrida(motoristaId, corridaId, despachante), {}, { headers, responseType: 'text' },
    );
  }

  //ALTERA O STATUS DO MOTORISTA PARA OFFLINE
  patchMarcarOffline(motoristaId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(
      AppConstants.signoffline(motoristaId),
      {},
      { headers, responseType: 'text' },
    );
  }

//LISTA TODAS AS CORRIDAS DOS CLIENTES EM ANDAMENTO
getCorridasClienteAndamento(clienteId: number, page: number): Observable<any> {
  const token = localStorage.getItem('tokenAutenticacao');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get(`${AppConstants.raceDespatcherInProgress(clienteId)}?page=${page}&size=10`, { headers });
}

  //LISTA TODAS AS CORRIDAS DOS CLIENTES FINALIZADAS
  getCorridasClienteFinalizadas(clienteId: number, page: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${AppConstants.raceDespatcherFinished(clienteId)}?page=${page}&size=10`, { headers });
  }

  //LISTA TODAS AS CORRIDAS DOS MOTORISTAS EM ANDAMENTO
  getCorridasMotoristaAndamento(motoristaId: number, page: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${AppConstants.raceDriveInProgress(motoristaId)}?page=${page}&size=10`, { headers });
  }

  //LISTA TODAS AS CORRIDAS DOS MOTORISTAS FINALIZADAS
  getCorridasMotoristaFinalizadas(motoristaId: number, page: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${AppConstants.raceDriveFinished(motoristaId)}?page=${page}&size=10`, { headers });
  }

  //ATUALIZA TODAS AS CORRIDAS PARA OS ADM EM ANDAMENTO
  getCorridasAdmAndamento(page: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${AppConstants.allRaceInProgress()}?page=${page}&size=10`, { headers });
  }

  //LISTA TODAS AS CORRIDAS PARA OS ADM FINALIZADAS
  getCorridasAdmFinalizadas(page: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${AppConstants.allRaceFinished()}?page=${page}&size=10`, { headers });
  }

  //ATUALIZA AS CORRIDAS
  patchAtualizarCorrida(corridaId: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.updateRace(corridaId), {}, { headers, responseType: 'text' },);
  }

  //CANCELA A CHAMADA DO MOTORISTA
  patchCancelarChamada(motoristaAtual: number): Observable<any>{
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch(AppConstants.cancelCall(motoristaAtual), {}, { headers, responseType: 'text' }, )
  }



  //AQUI COMEÇA AS ESTASTISTICAS
    //ESTATÍSTICAS POR ANO - CLIENTE
  getEstatisticasCliente(clienteId: number, ano: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.estatisticasCliente(clienteId, ano), { headers });
  }

  //ESTATÍSTICAS POR ANO - MOTORISTA
  getEstatisticasMotorista(motoristaId: number, ano: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.estatisticasMotorista(motoristaId, ano), { headers });
  }

  //ESTATÍSTICAS POR ANO - ADM
  getEstatisticasAdm(ano: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.estatisticasAdm(ano), { headers });
  }

  // ESTATÍSTICAS POR PERÍODO
  getEstatisticasPorPeriodo(inicio: string, fim: string, clienteId?: number, motoristaId?: number): Observable<any> {
    const token = localStorage.getItem('tokenAutenticacao');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    let url = `${AppConstants.baseRaceURL}/estatisticas/periodo?inicio=${inicio}&fim=${fim}`;
    if (clienteId) url += `&clienteId=${clienteId}`;
    if (motoristaId) url += `&motoristaId=${motoristaId}`;
    return this.http.get(url, { headers });
  }
}
