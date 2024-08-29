import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subject, elementAt, of, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { GenericService } from '../generic.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService) as AuthService;
  const gService = inject(GenericService) as GenericService;
  const router = inject(Router) as Router;

  const destroy$ = new Subject<boolean>();

  let datos: any;//Respuesta del API

  let isAuthenticated: boolean;
  let usuarioActual: any;
  
  //Subscribirse para obtener si esta autenticado
  authService.isAuthenticated.subscribe(
    (valor) => (isAuthenticated = valor)
  );
  //Subscribirse para obtener el usuario autenticado
  authService.usuarioActual.subscribe((x) => (usuarioActual = x));

  if (isAuthenticated) {
    const usuarioPermisos = usuarioActual.usuario.idTipoUsuario;
    const usuarioVacaciones = usuarioActual.usuario.vacacion;
    //roles.length && roles.indexOf(verify.role)===-1
    if(route.data['permisos'].length && !route.data['permisos'].includes(usuarioPermisos) && !route.data['permisos'].includes('Todos')){ 
      router.navigate(['/inicio'], {
        //Parametro para mostrar mensaje en home
        queryParams: { auth: 'no' }
      });
      return false;
    }

    if(route.data['vacaciones'] && route.data['vacaciones'].length && route.data['vacaciones'].includes(1) && (usuarioVacaciones == null || isNaN(Number(usuarioVacaciones)))) {
      router.navigate(['/bienvenida'], {
        //Parametro para mostrar mensaje en home
        queryParams: { auth: 'no' }
      });
      return false;
    }

    if(route.data['quiz'] && route.data['quiz'].length && route.data['quiz'].includes(1)){
      const idQuiz = route.params['id'];
      gService.get(`usuarioQuiz/${usuarioActual.usuario.id}/${idQuiz}`)
      .pipe(takeUntil(destroy$)).subscribe({
        next:(res) => {
        if (res.data.length == 0) {
          router.navigate(['/capacitacion'], {
            //Parametro para mostrar mensaje en home  
            queryParams: { auth: 'no' }
          });
          return false;
        }
        return true;
      }
    });
    }
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { auth: 'no'}
  });
  return false;
};