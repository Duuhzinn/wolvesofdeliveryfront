import { Routes } from '@angular/router';
import { Home } from './home/home';
import { App } from './app';
import { Login } from './login/login';

//DECLARANDO ROTAS
export const routes: Routes = [
    //CASO A ROTA FOR VAZIA ELE REDIRECIONA PARA A TELA DE LOGIN
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {path: 'home', component: Home},
    {path: 'login', component: Login}
];


