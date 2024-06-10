import { Routes } from '@angular/router';
import { ReclutamientoComponent } from './home/reclutamiento/reclutamiento.component';
import { PaginaNoEncontradaComponent } from './core/pagina-no-encontrada/pagina-no-encontrada.component';
import { InicioComponent } from './home/inicio/inicio.component';

export const routes: Routes = [
    { path: 'inicio', component: InicioComponent },
    { path: 'reclutamiento', component: ReclutamientoComponent },

    { path:'', redirectTo:'/inicio' ,pathMatch:'full'},
    { path:'**',component:PaginaNoEncontradaComponent},
];
