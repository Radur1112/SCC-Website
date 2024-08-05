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
import { CapacitacionAdminIndexComponent } from './capacitacion/capacitacion-admin-index/capacitacion-admin-index.component';
import { CapacitacionIndexComponent } from './capacitacion/capacitacion-index/capacitacion-index.component';
import { CapacitacionVideoComponent } from './capacitacion/capacitacion-video/capacitacion-video.component';
import { ForoIndexComponent } from './foro/foro-index/foro-index.component';
import { PlanillaAdminIndexComponent } from './planilla/planilla-admin-index/planilla-admin-index.component';
import { PlanillaSupervisorIndexComponent } from './planilla/planilla-supervisor-index/planilla-supervisor-index.component';
import { ForoDetalleComponent } from './foro/foro-detalle/foro-detalle.component';
import { PlanillaComprobanteIndexComponent } from './planilla/planilla-comprobante-index/planilla-comprobante-index.component';
import { PlanillaHistorialIndexComponent } from './planilla/planilla-historial-index/planilla-historial-index.component';
import { ForoHistorialComponent } from './foro/foro-historial/foro-historial.component';
import { UsuarioIncapacidadFormComponent } from './usuario/usuario-incapacidad-form/usuario-incapacidad-form.component';
import { UsuarioIncapacidadSupervisorComponent } from './usuario/usuario-incapacidad-supervisor/usuario-incapacidad-supervisor.component';
import { UsuarioVacacionFormComponent } from './usuario/usuario-vacacion-form/usuario-vacacion-form.component';
import { UsuarioVacacionSupervisorComponent } from './usuario/usuario-vacacion-supervisor/usuario-vacacion-supervisor.component';

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
  { path: 'incapacidad', component: UsuarioIncapacidadFormComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'incapacidad/justificantes', component: UsuarioIncapacidadSupervisorComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3]
    } 
  },
  { path: 'vacacion', component: UsuarioVacacionFormComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'vacacion/solicitudes', component: UsuarioVacacionSupervisorComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3]
    } 
  },

  { path: 'capacitacion/admin', component: CapacitacionAdminIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1]
    } 
  },
  { path: 'capacitacion/video/:idVideo/:idModulo', component: CapacitacionVideoComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'capacitacion', component: CapacitacionIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },

  { path: 'foro', component: ForoIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'foro/detalle/:id', component: ForoDetalleComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'foro/historial', component: ForoHistorialComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'foro/historial/:id', component: ForoHistorialComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },

  { path: 'planilla', component: PlanillaAdminIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'planilla/supervisor', component: PlanillaSupervisorIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'planilla/historial', component: PlanillaHistorialIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'comprobante', component: PlanillaComprobanteIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
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
