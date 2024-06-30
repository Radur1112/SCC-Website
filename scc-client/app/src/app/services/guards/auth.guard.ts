import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subject, elementAt, of, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { GenericService } from '../generic.service';
import { NotificacionService, TipoMessage } from '../notification.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router) as Router;
  const notificacion = inject(NotificacionService) as NotificacionService;

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
    //roles.length && roles.indexOf(verify.role)===-1
    if(route.data['permisos'].length && !route.data['permisos'].includes(usuarioPermisos) && !route.data['permisos'].includes('Todos')){ 
        router.navigate(['/inicio'], {
          //Parametro para mostrar mensaje en home
          queryParams: { auth: 'no' }
        });
      return false;
    }
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { auth: 'no'}
  });
  return false;
};