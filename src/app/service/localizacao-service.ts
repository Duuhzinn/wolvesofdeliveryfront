import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../app-constants';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class LocalizacaoService {

  private intervalo: any = null;

  constructor(private http: HttpClient) {}

  iniciarEnvioLocalizacao(motoristaId: number, motoristaNome: string, corridaId: number) {
    this.pararEnvioLocalizacao();

    if (Capacitor.isNativePlatform()) {
      // ✅ INICIA O FOREGROUND SERVICE
      const token = localStorage.getItem('tokenAutenticacao') ?? '';
      (Capacitor as any).Plugins.Rastreamento.iniciar({
        motoristaId: motoristaId.toString(),
        motoristaNome,
        corridaId: corridaId.toString(),
        token,
      });
    } else {
      // ✅ FALLBACK PARA WEB
      this.intervalo = setInterval(async () => {
        try {
          const posicao = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
          });
          const payload = {
            motoristaId,
            motoristaNome,
            corridaId,
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude
          };
          const token = localStorage.getItem('tokenAutenticacao');
          const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
          this.http.post(AppConstants.baseLocalizacaoURL, payload, { headers }).subscribe();
        } catch (err) {
          console.log('Erro ao obter localização:', err);
        }
      }, 3000);
    }
  }

  pararEnvioLocalizacao() {
    if (Capacitor.isNativePlatform()) {
      (Capacitor as any).Plugins.Rastreamento.parar();
    }
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}