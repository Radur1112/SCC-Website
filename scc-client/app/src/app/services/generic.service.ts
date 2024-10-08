import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertaService, TipoMessage } from './alerta.service';

@Injectable({
  providedIn: 'root',
})
export class GenericService {

  // URL del API, definida en enviroments->enviroment.ts
  urlAPI: string = environment.apiURL;
  
  //Información usuario actual
  currentUser: any;

  //Inyectar cliente HTTP para las solicitudes al API
  constructor(private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private alerta: AlertaService
  ) {
  }
 
  exportarExcel(endopoint: string): Observable<any> {
    return this.http.get(`${this.urlAPI}${endopoint}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError.bind(this)));
  }
 
  exportarPlanillas(param: string): Observable<any> {
    return this.http.get(`${this.urlAPI}planilla/exportarPlanillas`, { params: { param } , responseType: 'blob' })
      .pipe(catchError(this.handleError.bind(this)));
  }
 
  get(endopoint: string): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}${endopoint}`)
      .pipe(catchError(this.handleError.bind(this)));
  }
 
  getParam(endopoint: string, param: string): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}${endopoint}`, { params: { param } })
      .pipe(catchError(this.handleError.bind(this)));
  }
  
  post(endopoint: string, objCreate: any | any): Observable<any | any[]> {
    return this.http.post<any | any[]>(`${this.urlAPI}${endopoint}`, objCreate)
    .pipe(catchError(this.handleError.bind(this)));
  }
  
  put(endopoint: string, objUpdate: any | any): Observable<any | any[]> {
    let id = objUpdate.id === undefined ? objUpdate.Id : objUpdate.id;
    return this.http.put<any | any[]>(`${this.urlAPI}${endopoint}/${id}`, objUpdate)
    .pipe(catchError(this.handleError.bind(this)));
  }
  
  put2(endopoint: string, objUpdate: any | any): Observable<any | any[]> {
    return this.http.put<any | any[]>(`${this.urlAPI}${endopoint}`, objUpdate)
    .pipe(catchError(this.handleError.bind(this)));
  }
  
  delete(endopoint: string, filtro: any | any): Observable<any | any[]> {
    return this.http.delete<any | any[]>(`${this.urlAPI}${endopoint}/${filtro}`)
    .pipe(catchError(this.handleError.bind(this)));
  }

  public handleError(error: HttpErrorResponse): Observable<never> {
    let id: string = null;
    let message: string = null;
    if (error.error) {
      id = error.error.id;
      message = error.error.message;
      if (error.error.size) {
        id = 'sesion';
        message = 'Sesión expirada';
      }
    }

    //Códigos de estado HTTP con su respectivo mensaje
    switch (error.status) {
      case 400:
        if (id === 'duplicado') {
          this.alerta.mensaje('Registro', message, TipoMessage.error);
        }
        break;
      case 401:
        if (id === 'sesion') {
          this.authService.logout();
          this.alerta.mensaje('Usuario', message, TipoMessage.warning);
          this.router.navigate(['/login']);
        }
        if (id === 'baneado') {
          this.alerta.mensaje('Reclutamiento', message, TipoMessage.error);
        }
        if (id === 'planillaActivo') {
          this.alerta.mensaje('Planilla', message, TipoMessage.warning);
        }
        if (id === 'completada') {
          this.alerta.mensaje('Planilla', message, TipoMessage.error);
        }
        break;
      case 403:
        
        break;
      case 422:
        
        break;
      default:
        if (error.error && error.error.message === 'Failed to fetch') {
          this.alerta.mensaje('Error', 'Error al obtener el archivo. Seleccionelo nuevamente.', TipoMessage.error);
        }
        break;
    }
    //Mostrar un mensaje de error
    return throwError(() => new Error(message));
  }
}
