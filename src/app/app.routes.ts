import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { UsuarioComponent } from './componente/usuario-component/usuario-component';
import { MotoristaComponent } from './componente/motorista-component/motorista-component';
import { FilaComponent } from './componente/fila-component/fila-component';
import { CorridaFinalizadaComponent } from './componente/corrida-finalizada-component/corrida-finalizada-component';
import { CorridaAndamentoComponent } from './componente/corrida-andamento-component/corrida-andamento-component';
import { RelatorioMotoristasComponent } from './componente/relatorio-motoristas-component/relatorio-motoristas-component';
import { RankingMotoristasComponent } from './componente/ranking-motoristas-component/ranking-motoristas-component';
import { RelatoriosComponent } from './componente/relatorios-component/relatorios-component';
import { MaisComponent } from './componente/mais-component/mais-component';

//DECLARANDO ROTAS
export const routes: Routes = [
    
    {path: '', redirectTo: 'login', pathMatch: 'full' },//CASO A ROTA FOR VAZIA ELE REDIRECIONA PARA A TELA DE LOGIN
    {path: 'home', component: Home},//DECLARA A ROTA PARA A PAGINA HOME
    {path: 'login', component: Login},//DECLRA A ROTA PARA A PAGINA LOGIN
    {path: 'usuarioList', component: UsuarioComponent},//DECLARA A ROTA PARA A PAGINA USUARIO
    {path: 'motoristaStatus', component: MotoristaComponent}, // DECLARA A ROTA PARA A PAGINA DE MOTORISTAS
    {path: 'ordemDaFila' , component: FilaComponent},// DECLARA A ROTA PARA A PAGINA DE ORDEM DA FILA MOTORISTAS
    {path: 'corridas/andamento', component: CorridaAndamentoComponent}, // DECLARA AS ROTAS PARA AS CORRIDAS
    {path: 'corridas/finalizada', component: CorridaFinalizadaComponent}, // DECLARA AS ROTAS PARA AS CORRIDAS
    {path: 'relatorioCorrida', component: RelatoriosComponent}, // DECLARA AS ROTAS PARA OS RELATORIOS DOS MOTORISTAS
    {path: 'relatorioMotoristas', component: RelatorioMotoristasComponent}, // DECLARA AS ROTAS PARA OS RELATORIOS DOS MOTORISTAS
    {path: 'rankingMotoristas', component: RankingMotoristasComponent}, // DECLARA AS ROTAS PARA OS RELATORIOS DOS RANKING DO MOTORISTA
    {path: 'configuracoes', component: MaisComponent} //DECLARA A ROTA PARA AS CONFIGURAÇÕES
];


