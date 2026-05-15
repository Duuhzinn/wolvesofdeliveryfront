import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { UsuarioComponent } from './componente/usuario-component/usuario-component';

//DECLARANDO ROTAS
export const routes: Routes = [
    
    {path: '', redirectTo: 'login', pathMatch: 'full' },//CASO A ROTA FOR VAZIA ELE REDIRECIONA PARA A TELA DE LOGIN
    {path: 'home', component: Home},//DECLARA A ROTA PARA A PAGINA HOME
    {path: 'login', component: Login},//DECLRA A ROTA PARA A PAGINA LOGIN
    {path: 'usuarioList', component: UsuarioComponent},//DECLARA A ROTA PARA A PAGINA USUARIO
    
];


