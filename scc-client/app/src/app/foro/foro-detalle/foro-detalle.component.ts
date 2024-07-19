import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-foro-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule, MatTooltipModule, MatSelectModule, MatMenuModule],
  templateUrl: './foro-detalle.component.html',
  styleUrl: './foro-detalle.component.scss',
  providers: [DatePipe]
})
export class ForoDetalleComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  usuarioActual: any;
  isAdmin: any;
  foroId: any;
  foro: any;

  filtroRespuestas: any;

  respuestaForm: FormGroup;

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private notificacion: NotificacionService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.foroId = params.get('id');
      
      this.authService.usuarioActual.subscribe((x) => {
        if (x && Object.keys(x).length !== 0) {
          this.usuarioActual = x.usuario;
          this.isAdmin = this.usuarioActual.idTipoUsuario == 1;

          this.cargarDatos();
        } else {
          this.usuarioActual = null;
          this.isAdmin = false;
        }
      });
    });
  }
  
  cargarDatos() {
    this.gService.get(`foro/${this.foroId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.foro = res.data;
        this.filtroRespuestas = this.foro.respuestasForo;
        this.formularioReactive();
      }
    });
  }
  
  formularioReactive() {
    this.respuestaForm = this.fb.group({
      idForo: [this.foro.id],
      idUsuario: [this.usuarioActual.id],
      descripcion: ['', [Validators.required, Validators.maxLength(3000)]],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.respuestaForm.controls[control].hasError(error);
  };


  busqueda(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    
    this.filtroRespuestas = this.foro.respuestasForo.filter(respuesta => respuesta.descripcion.includes(filtro) || this.datePipe.transform(respuesta.fecha, "EEEE d 'de' MMMM y, h:mm a").replace(/\u00A0/g, ' ').includes(filtro) || respuesta.usuarioNombre.includes(filtro));
  }

  borrarRespuesta(respuesta: any) {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.put(`usuarioForoRespuesta/borrar`, respuesta)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.notificacion.mensaje('Respuesta', 'Respuesta eliminada correctamente', TipoMessage.success);
              this.cargarDatos();
            },
            error:(err) => {
              console.log(err);
            }
          });
        }
      });
  }

  cancelarRespuesta() {
    this.respuestaForm.reset();
  }

  responderForo() {
    if(this.respuestaForm.invalid) {
      return;
    }

    this.gService.post(`usuarioForoRespuesta/`, this.respuestaForm.value)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.cargarDatos();
      }
    });
  }
}
