import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { AppConstants } from '../app-constants';

@Injectable({ providedIn: 'root' })
export class LogradouroService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  listar(): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('tokenAutenticacao') : '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.listarTodosLogradouros, { headers });
  }

  buscar(rua: string, pagina: number): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('tokenAutenticacao') : '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(AppConstants.buscarLogradouro(rua, pagina), { headers });
  }
}