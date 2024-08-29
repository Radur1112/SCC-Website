import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService, TipoMessage } from '../../services/alerta.service';

@Component({
  selector: 'app-usuario-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule],
  templateUrl: './usuario-login.component.html',
  styleUrl: './usuario-login.component.scss'
})
export class UsuarioLoginComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  loginForm: FormGroup

  esconderPassword = true;

  usuarioActual: any;
  
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService
  ) {
    
    this.reactiveForm();
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.router.navigate(['usuario']);
      }
    });
    this.mensajes();
  }

  mensajes() {
   let register=false;
   let auth='';
   //Obtener parámetros de la URL
   this.route.queryParams.subscribe((params)=>{
    auth=params['auth'] || '';
    if(auth){
      //this.alerta.mensaje('Usuario', 'Acceso denegado', TipoMessage.warning)
    }
   })
   
  }
  
  reactiveForm() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      password: ['', Validators.required],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.loginForm.controls[control].hasError(error);
  };

  login() {
    this.authService.loginUsuario(this.loginForm.value)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.loginForm.reset();
        this.router.navigate(['bienvenida']);
      },
      error:(err) => {
        if (err.status == 401) {
          this.alerta.mensaje('Usuario', 'Credenciales Incorrectas', TipoMessage.error);
        }
      }
    });
  }
}
