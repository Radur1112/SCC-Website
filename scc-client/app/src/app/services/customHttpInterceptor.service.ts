import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError } from 'rxjs/operators';
import { AuthService } from "./auth.service";
import { of } from "rxjs";
import { environment } from '../../environments/environment';

export const customHttpInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(environment.apiURL)) {
    const authService = inject(AuthService) as AuthService;

    //Obtener token
    let token = null;
    if (typeof window !== 'undefined' && localStorage.getItem('usuarioActual')) {
      token = JSON.parse(localStorage.getItem('usuarioActual')).token;
    }
    //Agregar headers a la solicitud
    if (token) {
      //Header con el token
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
    }
    // Check if the request body is FormData or JSON
    if (req.body instanceof FormData) {
      
    } else {
    
      //Opcional indicar el tipo de contenido JSON
      if (!req.headers.has('Content-Type') && !req.url.includes('verificar') && !req.url.includes('reclutamiento') && !req.url.includes('contacto')) {
        req = req.clone({
          setHeaders: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
      }
    }

    //Capturar el error
    return next(req);
  }
  return next(req);
}