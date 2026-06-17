import { afterNextRender, ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../app-constants';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-logradouros-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logradouros-component.html',
  styleUrl: './logradouros-component.css',
})
export class LogradourosComponent implements OnInit {
  logradouros: any[] = [];
  logradouro: any = {};
  termoBusca: string = '';
  modalInsertEdit: boolean = false;
  modalSucess: boolean = false;
  importando: boolean = false;
  importadosCount: number = 0;
  paginaAtual: number = 0;
  totalPaginas: number = 0;
  carregando: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    afterNextRender(() => {
      this.listar();
    });
  }

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const posicaoAtual = window.innerHeight + window.scrollY;
    const alturaTotal = document.body.offsetHeight;

    if (
      posicaoAtual >= alturaTotal - 100 &&
      !this.carregando &&
      this.paginaAtual < this.totalPaginas - 1
    ) {
      this.paginaAtual++;
      this.listar();
    }
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('tokenAutenticacao');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listar(): void {
    if (this.carregando) return;
    this.carregando = true;

    const url = this.termoBusca.trim()
      ? AppConstants.buscarLogradouro(this.termoBusca, this.paginaAtual)
      : AppConstants.listarLogradouros(this.paginaAtual);

    this.http.get<any>(url, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.logradouros = [...this.logradouros, ...data.content];
        this.totalPaginas = data.totalPages;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.carregando = false;
      },
    });
  }

  buscar(): void {
    this.paginaAtual = 0;
    this.logradouros = [];
    this.listar();
  }

  chamarModalNovo(): void {
    this.logradouro = {};
    this.modalInsertEdit = true;
  }

  fecharModal(): void {
    this.modalInsertEdit = false;
    this.modalSucess = false;
    this.logradouro = {};
    this.paginaAtual = 0;
    this.logradouros = [];
    this.listar();
  }

  salvar(): void {
    this.logradouro.rua = this.logradouro.rua?.toUpperCase();
    this.logradouro.bairro = this.logradouro.bairro?.toUpperCase();
    this.logradouro.cidade = this.logradouro.cidade?.toUpperCase();
    this.logradouro.cep = this.logradouro.cep?.trim();

    this.http.post<any>(AppConstants.salvarLogradouro, this.logradouro, { headers: this.headers() }).subscribe({
      next: () => {
        this.modalInsertEdit = false;
        this.modalSucess = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });
  }

  deletar(id: number): void {
    this.http.delete(AppConstants.deletarLogradouro(id), { headers: this.headers() }).subscribe({
      next: () => {
        this.paginaAtual = 0;
        this.logradouros = [];
        this.listar();
      },
      error: (err) => console.log(err),
    });
  }

  importarExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.importando = true;
    this.importadosCount = 0;
    this.cdr.detectChanges();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const dados: any[] = XLSX.utils.sheet_to_json(sheet);

      const logradouros = dados
        .map((row: any) => ({
          rua: String(row['RUA'] ?? row['rua'] ?? '').toUpperCase(),
          bairro: String(row['BAIRRO'] ?? row['bairro'] ?? '').toUpperCase(),
          cidade: String(row['CIDADE'] ?? row['cidade'] ?? '').toUpperCase(),
          cep: String(row['CEP'] ?? row['cep'] ?? '').trim(),
        }))
        .filter((l) => l.rua && l.bairro && l.cidade && l.cep);

      this.http.post<any[]>(AppConstants.salvarTodosLogradouros, logradouros, { headers: this.headers() }).subscribe({
        next: () => {
          this.importando = false;
          this.modalInsertEdit = false;
          this.modalSucess = true;
          this.paginaAtual = 0;
          this.logradouros = [];
          this.listar();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.importando = false;
          this.cdr.detectChanges();
        },
      });
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  }
}