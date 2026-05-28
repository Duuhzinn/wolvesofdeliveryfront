import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { UsuarioComponent } from './componente/usuario-component/usuario-component';
import { MotoristaComponent } from './componente/motorista-component/motorista-component';
import { FilaComponent } from './componente/fila-component/fila-component';
import { CorridaComponent } from './componente/corrida-component/corrida-component';

//DECLARANDO ROTAS
export const routes: Routes = [
    
    {path: '', redirectTo: 'login', pathMatch: 'full' },//CASO A ROTA FOR VAZIA ELE REDIRECIONA PARA A TELA DE LOGIN
    {path: 'home', component: Home},//DECLARA A ROTA PARA A PAGINA HOME
    {path: 'login', component: Login},//DECLRA A ROTA PARA A PAGINA LOGIN
    {path: 'usuarioList', component: UsuarioComponent},//DECLARA A ROTA PARA A PAGINA USUARIO
    {path: 'motoristaStatus', component: MotoristaComponent}, // DECLARA A ROTA PARA A PAGINA DE MOTORISTAS
    {path: 'ordemDaFila' , component: FilaComponent},// DECLARA A ROTA PARA A PAGINA DE ORDEM DA FILA MOTORISTAS
    {path: 'corridas/:status', component: CorridaComponent} // DECLARA AS ROTAS PARA AS CORRIDAS
];


