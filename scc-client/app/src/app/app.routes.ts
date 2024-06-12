import { Routes } from '@angular/router';
import { ReclutamientoComponent } from './home/reclutamiento/reclutamiento.component';
import { PaginaNoEncontradaComponent } from './core/pagina-no-encontrada/pagina-no-encontrada.component';
import { InicioComponent } from './home/inicio/inicio.component';
import { SobreNosotrosComponent } from './home/sobre-nosotros/sobre-nosotros.component';
import { UsuarioLoginComponent } from './usuario/usuario-login/usuario-login.component';

export const routes: Routes = [
    { path: 'inicio', component: InicioComponent },
    { path: 'sobre-nosotros', component: SobreNosotrosComponent },
    { path: 'reclutamiento', component: ReclutamientoComponent },
    
    { path: 'login', component: UsuarioLoginComponent },

    { path:'', redirectTo:'/inicio' ,pathMatch:'full'},
    { path:'**',component:PaginaNoEncontradaComponent},
];
