import { Routes } from '@angular/router';
import { ReclutamientoComponent } from './home/reclutamiento/reclutamiento.component';
import { PaginaNoEncontradaComponent } from './core/pagina-no-encontrada/pagina-no-encontrada.component';
import { InicioComponent } from './home/inicio/inicio.component';
import { SobreNosotrosComponent } from './home/sobre-nosotros/sobre-nosotros.component';
import { UsuarioLoginComponent } from './usuario/usuario-login/usuario-login.component';
import { ContactoComponent } from './home/contacto/contacto.component';
import { UsuarioFormComponent } from './usuario/usuario-form/usuario-form.component';
import { UsuarioIndexComponent } from './usuario/usuario-index/usuario-index.component';
import { AuthGuard } from './services/guards/auth.guard';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },

  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  { path: 'reclutamiento', component: ReclutamientoComponent },
  { path: 'contacto', component: ContactoComponent },
  
  { path: 'login', component: UsuarioLoginComponent },
  { path: 'usuario', component: UsuarioIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1]
    }
  },
  { path: 'usuario/registrar', component: UsuarioFormComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1]
    } 
  },
  { path: 'usuario/actualizar/:id', component: UsuarioFormComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1]
    } 
  },

  { path:'', redirectTo:'/inicio' ,pathMatch:'full'},
  { path:'**',component:PaginaNoEncontradaComponent},

  /*
  { path:'condominio', component: CondominioIndexComponent, canActivate:[AuthGuard],
      data:{
        permisos: ['SuperAdmin', 'Administrador']
      }
  },
  */
];
