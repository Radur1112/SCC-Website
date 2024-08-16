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
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../services/confirmation.service';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ForoFormDialogComponent } from '../foro-form-dialog/foro-form-dialog.component';
import { ConvertLineBreaksService } from '../../services/convert-line-breaks.service';

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

  foroArchivos: any = [];
  foroRespuestas: any = [];

  respuestaForm: FormGroup;

  usuarioRespuesta: any;

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    public convertService: ConvertLineBreaksService,
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
          this.foroArchivos = this.foro.archivos;
        }

        if (this.foro.respuestas) {
          this.foroRespuestas = this.foro.respuestas;
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

  busqueda(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    
    this.filtroRespuestas = this.respuestas.filter(respuesta => 
      respuesta.descripcion.includes(filtro) || 
      this.datePipe.transform(respuesta.fechaCreado, "dd/MM/YYYY").replace(/\u00A0/g, ' ').includes(filtro) || 
      this.datePipe.transform(respuesta.fechaCreado, "dd-MM-YYYY").replace(/\u00A0/g, ' ').includes(filtro) || 
      this.datePipe.transform(respuesta.fechaCreado, "EEEE d 'de' MMMM y, h:mm a").replace(/\u00A0/g, ' ').includes(filtro) || 
      respuesta.usuarioNombre.includes(filtro));
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
            this.alerta.mensaje('Foro', 'Foro eliminado correctamente', TipoMessage.success);
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
              this.alerta.mensaje('Respuesta', 'Respuesta eliminada correctamente', TipoMessage.success);
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
        this.alerta.mensaje('Respuesta', 'Foro respondido correctamente', TipoMessage.success);
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
        this.alerta.mensaje('Respuesta', 'Foro respondido correctamente', TipoMessage.success);
      }
    });
  }
  

  openForoFormDialog(crear: boolean, foroId: any) {
    let width = '800px';
    let data = { 
      crear: crear,
      foroId: foroId
    };
    
    const dialogRef = this.dialog.open(ForoFormDialogComponent, {
      data,
      width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.actualizarForo(result);
        }
      }
    });
  }
  actualizarForo(foro: any) {
    this.gService.put(`foro`, foro)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log(foro)
        const archivoCreatePromise = foro.archivos && foro.archivos.length > 0 ? this.crearArchivos(foro.id, foro.archivos) : Promise.resolve();
        const archivoUpdatePromise = foro.archivosBorrar && foro.archivosBorrar.length > 0 ? this.actualizarArchivos(foro.id, foro.archivosBorrar) : Promise.resolve();
        const respuestaPromise = foro.respuestasBorrarIds || foro.respuestasNuevas ? this.actualizarRespuestas(foro.id, {respuestasBorrarIds: foro.respuestasBorrarIds, respuestasNuevas: foro.respuestasNuevas}) : Promise.resolve();
      
        Promise.all([archivoCreatePromise, archivoUpdatePromise, respuestaPromise])
          .then(() => {
            this.alerta.mensaje('Foro', 'Foro editado correctamente', TipoMessage.success);
          })
          .catch(error => {
            console.error("Error al crear archivos or respuestas:", error);
            this.alerta.mensaje('Foro', 'Error al crear archivos o respuestas', TipoMessage.error);
          });
      }
    });
  }

  crearArchivos(idForo: any, archivos: any) {
    const formData = new FormData();
    archivos.forEach((file, index) => {
      formData.append(`archivo`, file, file.name);
    });

    this.gService.post(`foro/archivos/${idForo}`, formData)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.getForo();
      }
    });
  }

  actualizarArchivos(idForo: any, data: any) {
    this.gService.put2(`foro/archivos/${idForo}`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.getForo();
      }
    });
  }

  actualizarRespuestas(idForo: any, data: any) {
    this.gService.put2(`foro/respuestas/${idForo}`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.getForo();
      }
    });
  }
}
