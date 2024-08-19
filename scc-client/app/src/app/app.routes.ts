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
import { PlanillaAnotacionIndexComponent } from './planilla/planilla-anotacion-index/planilla-anotacion-index.component';
import { UsuarioIncapacidadIndexComponent } from './usuario/usuario-incapacidad-index/usuario-incapacidad-index.component';
import { UsuarioVacacionIndexComponent } from './usuario/usuario-vacacion-index/usuario-vacacion-index.component';
import { HomeIndexComponent } from './home/home-index/home-index.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },

  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  { path: 'reclutamiento', component: ReclutamientoComponent },
  { path: 'contacto', component: ContactoComponent },
  
  { path: 'bienvenida', component: HomeIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  
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
  { path: 'incapacidad/historial', component: UsuarioIncapacidadIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'incapacidad/historial/:id', component: UsuarioIncapacidadIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3]
    } 
  },
  { path: 'vacacion', component: UsuarioVacacionFormComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos'],
      vacaciones: [1],
    } 
  },
  { path: 'vacacion/solicitudes', component: UsuarioVacacionSupervisorComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3]
    } 
  },
  { path: 'vacacion/historial', component: UsuarioVacacionIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },
  { path: 'vacacion/historial/:id', component: UsuarioVacacionIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3]
    } 
  },

  { path: 'capacitacion/admin', component: CapacitacionAdminIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 4]
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
      permisos: [1]
    } 
  },
  { path: 'foro/historial/:id', component: ForoHistorialComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1]
    } 
  },

  { path: 'planilla', component: PlanillaAdminIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3, 5]
    } 
  },
  { path: 'planilla/supervisor', component: PlanillaSupervisorIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3, 5]
    } 
  },
  { path: 'planilla/anotaciones', component: PlanillaAnotacionIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3, 5]
    } 
  },
  { path: 'planilla/anotaciones/:fechaInicio/:fechaFinal', component: PlanillaAnotacionIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 3, 5]
    } 
  },
  { path: 'planilla/historial', component: PlanillaHistorialIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: [1, 5]
    } 
  },
  { path: 'comprobante/:id', component: PlanillaComprobanteIndexComponent, canActivate:[AuthGuard],
    data:{
      permisos: ['Todos']
    } 
  },

  { path:'nosotros', redirectTo:'/sobre-nosotros', pathMatch:'full'},
  { path:'', redirectTo:'/inicio', pathMatch:'full'},
  { path:'**',component:PaginaNoEncontradaComponent},

  /*
  { path:'condominio', component: CondominioIndexComponent, canActivate:[AuthGuard],
      data:{
        permisos: ['SuperAdmin', 'Administrador']
      }
  },
  */
];
