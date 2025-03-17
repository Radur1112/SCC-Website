import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Observable, Subject, map, startWith, takeUntil } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatSelectModule } from '@angular/material/select';
import { ForoSubirArchivoComponent } from "../foro-subir-archivo/foro-subir-archivo.component"
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-foro-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule, MatDialogModule, MatSelectModule, ForoSubirArchivoComponent, MatIconModule],
  templateUrl: './foro-form-dialog.component.html',
  styleUrl: './foro-form-dialog.component.scss'
})
export class ForoFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  foroForm: FormGroup;
  tituloForm: any;

  crear: any;
  foroId: any;
  usuarioActual: any;

  tipoForos: any;
  archivosExistentes: any = [];
  respuestasExistentes: any = [];

  sizeError: any;
  
  respuestasRepetidas: any = [];
  borrarRespuestas: number[] = [];
  borrarArchivos: any = [];
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ForoFormDialogComponent>,
    private fb: FormBuilder
  ) {
    this.crear = this.data.crear;
    this.foroId = this.data.foroId;

    this.formularioReactive();
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
      } else {
        this.usuarioActual = null;
      }
    });
    
    if (this.crear) {
      this.tituloForm = 'Crear';
    } else {
      this.tituloForm = 'Actualizar';
    }
    this.getTipoForos();
  }
  
  formularioReactive() {
    this.foroForm = this.fb.group({
      id: [null],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(3000)]],
      archivo: [null],
      existente: [null],
      respuestas: this.fb.array([])
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.foroForm.controls[control].hasError(error);
  };

  getTipoForos() {
    this.gService.get(`tipoForo`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipoForos = res.data;

        if (!this.crear) {
          
      this.cargarDatos();
        }
      }
    });
  }

  cargarDatos() {
    this.gService.get(`foro/${this.foroId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        let foro = res.data;
        
        if (foro.archivos !== null) {
          foro.archivos = foro.archivos.map(archivo => ({
            ...archivo,
            nombreArchivo: archivo.ubicacion.substring(archivo.ubicacion.lastIndexOf('/') + 1)
          }));
          this.archivosExistentes = foro.archivos;
        }
        
        this.foroForm.setValue({
          id: this.foroId,
          tipo: this.tipoForos.find(tp => tp.id === foro.idTipoForo),
          titulo: foro.titulo,
          descripcion: foro.descripcion,
          archivo: [],
          existente: this.archivosExistentes,
          respuestas: []
        });
        this.foroForm.get('tipo').disable();

        if (foro.respuestas !== null) {
          for (let respuesta of foro.respuestas) {
            this.agregarRespuesta(respuesta.descripcion, true);
          }
          this.respuestasExistentes = foro.respuestas;
        }
      }
    });
  }

  onArchivosSelected(archivos: any) {
    this.foroForm.get('archivo').setErrors(null);
    
    archivos.forEach(archivo => {
      const maxSizeInBytes = 10 * 1024 * 1024; // Tamaño máximo de 10 MB
  
      this.sizeError = maxSizeInBytes / 1024 / 1024;
  
      if (archivo.size > maxSizeInBytes) {
        this.foroForm.get('archivo').setErrors({'size': true});
      }
    });

    if (!this.foroForm.get('archivo').getError('size')) {
      this.foroForm.get('archivo').setValue(archivos);
    }
  }

  onBorrarArchivosSelected(borrarArchivo: any) {
    this.borrarArchivos.push(borrarArchivo)
  }


  respuestas(): FormArray {
    return this.foroForm.get('respuestas') as FormArray;
  }

  nuevaRespuesta(text: string = '', disabled: boolean = false) {
    return this.fb.group({
      respuesta: [{ value: text, disabled: disabled }, [Validators.required, Validators.maxLength(250)]]
    });
  }

  agregarRespuesta(text: string = '', disabled: boolean = false) {
    this.respuestas().push(this.nuevaRespuesta(text, disabled));
  }

  removerRespuesta(index: any) {
    if (this.respuestasExistentes && this.respuestasExistentes.length > 0) {
      const respuesta = this.respuestas().controls[index].value.respuesta;
      const id = this.respuestasExistentes.find(re => re.descripcion == respuesta)?.id
      if (id) {
        this.borrarRespuestas.push(id);
      }
    }
    this.respuestas().removeAt(index);
  }

  removerRespuestas() {
    this.respuestas().clear();
  }

  public errorHandlingRespuesta = (control: string, error: string, index: number, arrayName: string) => {
    return (this.foroForm.get(arrayName) as FormArray).at(index).get(control).hasError(error);
  };

  verificarEncuesta() {
    if (this.foroForm.value.tipo.descripcion == 'Encuesta' && this.respuestas().controls.length == 0) {
      this.agregarRespuesta();
    } else {
      this.removerRespuestas();
    }
  }

  verificarIguales() {
    const respuestas = this.respuestas().controls.map(item => item.value.respuesta.trim());
    const unicas = new Set();
    this.respuestasRepetidas = [];
  
    for (const respuesta of respuestas) {
      if (unicas.has(respuesta)) {
        this.respuestasRepetidas.push(respuesta);
      } else {
        unicas.add(respuesta);
      }
    }

    if (this.respuestasRepetidas.length > 0) {
      this.foroForm.get('respuestas').setErrors({'duplicate': true});
    }

  }


  guardarForo() {
    if(this.foroForm.invalid) {
      return;
    }
    
    let foro = {};
    if (this.crear) {
      foro = {
        idTipoForo: this.foroForm.value.tipo.id,
        idUsuario: this.usuarioActual.id,
        titulo: this.foroForm.value.titulo,
        descripcion: this.foroForm.value.descripcion,
        archivos: this.foroForm.value.archivo,
        respuestas: this.respuestas().value
      }
    } else {
      this.foroForm.get('tipo').enable();
      
      foro = {
        id: this.foroForm.value.id,
        idTipoForo: this.foroForm.value.tipo.id,
        idUsuario: this.usuarioActual.id,
        titulo: this.foroForm.value.titulo,
        descripcion: this.foroForm.value.descripcion,
        archivos: this.foroForm.value.archivo,
        archivosBorrar: this.borrarArchivos,
        respuestasBorrarIds: this.borrarRespuestas,
        respuestasNuevas: this.respuestas().controls.filter(r => !r.disabled).map(c => c.value)
      }
    }
    
    this.dialogRef.close(foro);
  }
}
