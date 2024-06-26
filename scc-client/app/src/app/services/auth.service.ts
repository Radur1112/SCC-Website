import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { NotificacionService, TipoMessage } from './notification.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  serverUrl = environment.apiURL;
  
  //Variable observable para gestionar la información del usuario, con características especiales
  private usuarioActualSubject: BehaviorSubject<any>;
  //Variable observable para gestionar la información del usuario
  public usuarioActual: Observable<any>;
  //Booleano para estado de usuario authenticated
  private authenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
    private router: Router,
    private notificacion: NotificacionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let usuarioActual = null;
    
    // Only access localStorage if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    }

    this.usuarioActualSubject = new BehaviorSubject<any>(usuarioActual);
    this.usuarioActual = this.usuarioActualSubject.asObservable();
  }

  //Obtener el valor del usuario actual
  public get currentUsuarioValue(): any {
    return this.usuarioActualSubject.value;
  }
  
  get isAuthenticated() {
    if (this.currentUsuarioValue !== undefined && this.currentUsuarioValue !== null && Object.keys(this.currentUsuarioValue).length !== 0) {
      this.authenticated.next(true);
    } else {
      this.authenticated.next(false);
    }
    return this.authenticated.asObservable();
  }

  registrarUsuario(usuario: any) {
    return this.http.post<any>(`${this.serverUrl}usuario/registrar`, usuario)
    .pipe(catchError(this.handleError.bind(this)));
  }

  registrarMultiplesUsuarios(usuarios: any) {
    return this.http.post<any>(`${this.serverUrl}usuario/registrar/multiples`, usuarios)
    .pipe(catchError(this.handleError.bind(this)));
  }

  loginUsuario(usuario: any) {
    return this.http.post<any>(`${this.serverUrl}usuario/login`, usuario)
    .pipe(map((response) => {
        // almacene los detalles del usuario y el token jwt
        // en el almacenamiento local para mantener al usuario conectado entre las actualizaciones de la página
        localStorage.setItem('usuarioActual', JSON.stringify(response.data));
        this.authenticated.next(true);
        this.usuarioActualSubject.next(response.data);
        return response;
      })
    );
  }
  
  //Logout de usuario autentificado
  logout() {
    let usuario = this.usuarioActualSubject.value;
    if (usuario) {
      // eliminar usuario del almacenamiento local para cerrar la sesión del usuario
      localStorage.removeItem('usuarioActual');
      //Eliminarlo del observable del usuario actual
      this.usuarioActualSubject.next(null);
      //Eliminarlo del observable del boleano si esta authenticated
      this.authenticated.next(false);
      return true;
    }
    return false;
  }

  public handleError(error: HttpErrorResponse): Observable<never> {
    let id: string = null;
    let message: string = null;
    id = error.error.id;
    message = error.error.message;
    //Códigos de estado HTTP con su respectivo mensaje
    switch (error.status) {
      case 400:
        if (id === 'duplicado') {
          this.notificacion.mensaje('Registro', message, TipoMessage.error);
        }
        break;
      case 401:
        if (id === 'sesion') {
          this.logout();
          this.notificacion.mensaje('Usuario', message, TipoMessage.warning);
          this.router.navigate(['/login']);
        }
        break;
      case 403:

        break;
      case 422:
        
        break;
    }
    //Mostrar un mensaje de error
    throw new Error(message)
  }
}
