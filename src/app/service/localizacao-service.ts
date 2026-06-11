import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { AppConstants } from '../app-constants';

@Injectable({
  providedIn: 'root'
})
export class LocalizacaoService {

  private intervalo: any = null;

  constructor(private http: HttpClient) {}

  iniciarEnvioLocalizacao(motoristaId: number, motoristaNome: string, corridaId: number) {
    this.pararEnvioLocalizacao();

    this.intervalo = setInterval(async () => {
      try {
        const posicao = await Geolocation.getCurrentPosition();
        const payload = {
          motoristaId,
          motoristaNome,
          corridaId,
          lat: posicao.coords.latitude,
          lng: posicao.coords.longitude
        };
        this.http.post(AppConstants.baseLocalizacaoURL, payload).subscribe();
      } catch (err) {
        console.log('Erro ao obter localização:', err);
      }
    }, 3000);
  }

  pararEnvioLocalizacao() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}