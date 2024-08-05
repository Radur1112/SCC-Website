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
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-foro-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatRadioModule, MatSelectModule, MatMenuModule, MatListModule],
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

  filtroRespuestas: any = [];
  respuestas: any = [];

  respuestaForm: FormGroup;

  usuarioRespuesta: any;

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

          this.getForo();
        } else {
          this.usuarioActual = null;
          this.isAdmin = false;
        }
      });
    });
  }
  
  getForo() {
    this.gService.get(`foro/${this.foroId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.foro = res.data;
        
        if (this.foro.archivos) {
          this.foro.archivos = this.foro.archivos.map(archivo => ({
            ...archivo,
            nombreArchivo: archivo.ubicacion.substring(archivo.ubicacion.lastIndexOf('/') + 1)
          }));
        }
        console.log(this.foro)
        this.registrarAcceso();
        this.getRespuestas();
        this.formularioReactive();
      }
    });
  }
  
  getRespuestas() {
    this.gService.get(`usuariofororespuesta/foro/${this.foroId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.respuestas = res.data;
        this.filtroRespuestas = this.respuestas;
      }
    });
  }

  registrarAcceso(idForoArchivo?: any) {
    const acceso = {
      idForo: this.foroId,
      idForoArchivo: idForoArchivo,
      idUsuario: this.usuarioActual.id
    }

    this.gService.post(`foroHistorial`, acceso)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        
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

  convertLineBreaks(descripcion: string): string {
    return descripcion.replace(/\n/g, '<br>');
  }

  busqueda(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    
    this.filtroRespuestas = this.respuestas.filter(respuesta => respuesta.descripcion.includes(filtro) || this.datePipe.transform(respuesta.fecha, "EEEE d 'de' MMMM y, h:mm a").replace(/\u00A0/g, ' ').includes(filtro) || respuesta.usuarioNombre.includes(filtro));
  }

  historialForo(id: any) {
    this.router.navigate(['foro/historial', id]);
  }

  borrarForo(foro: any) {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        this.gService.put(`foro/borrar`, foro)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.notificacion.mensaje('Foro', 'Foro eliminado correctamente', TipoMessage.success);
            this.router.navigate(['foro']);
          },
          error:(err) => {
            console.log(err);
          }
        });
      }
    });
  }

  borrarRespuesta(respuesta: any) {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.put(`usuarioForoRespuesta/borrar`, respuesta)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.notificacion.mensaje('Respuesta', 'Respuesta eliminada correctamente', TipoMessage.success);
              this.getForo();
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
        this.respuestaForm.reset();
        this.getForo();
        this.notificacion.mensaje('Respuesta', 'Foro respondido correctamente', TipoMessage.success);
      }
    });
  }

  responderEncuesta() {
    if(!this.usuarioRespuesta) {
      return; 
    }

    const data = {
      idForo: this.foroId,
      idUsuario: this.usuarioActual.id,
      idForoRespuesta: this.usuarioRespuesta.id
    }

    this.gService.post(`usuarioForoRespuesta/`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.respuestaForm.reset();
        this.getForo();
        this.notificacion.mensaje('Respuesta', 'Foro respondido correctamente', TipoMessage.success);
      }
    });
  }
}
