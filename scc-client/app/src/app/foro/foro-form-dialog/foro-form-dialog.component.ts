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
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule, MatDialogModule, MatSelectModule, ForoSubirArchivoComponent, MatIconModule],
  templateUrl: './foro-form-dialog.component.html',
  styleUrl: './foro-form-dialog.component.scss'
})
export class ForoFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  foroForm: FormGroup;
  tituloForm: any;

  crear: any;
  usuarioActual: any;

  tipoForos: any;

  sizeError: any;
  
  respuestasRepetidas: any = [];
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ForoFormDialogComponent>,
    private fb: FormBuilder
  ) {
    this.crear = this.data.crear;

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


  respuestas(): FormArray {
    return this.foroForm.get('respuestas') as FormArray;
  }

  nuevaRespuesta() {
    return this.fb.group({
      respuesta: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  agregarRespuesta() {
    this.respuestas().push(this.nuevaRespuesta());
  }

  removerRespuesta(index: any) {
    this.respuestas().removeAt(index);
  }

  removerRespuestas() {
    this.respuestas().clear();
  }

  public errorHandlingRespuesta = (control: string, error: string, index: number, arrayName: string) => {
    return (this.foroForm.get(arrayName) as FormArray).at(index).get(control).hasError(error);
  };

  verificarEncuesta() {
    if (this.foroForm.value.tipo.descripcion == 'Encuesta' && this.respuestas().length == 0) {
      this.agregarRespuesta();
    } else {
      this.removerRespuestas();
    }
  }

  verificarIguales() {
    const respuestas = this.respuestas().value.map(item => item.respuesta.trim());
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
    
    const foro = {
      idTipoForo: this.foroForm.value.tipo.id,
      idUsuario: this.usuarioActual.id,
      titulo: this.foroForm.value.titulo,
      descripcion: this.foroForm.value.descripcion,
      archivos: this.foroForm.value.archivo,
      respuestas: this.respuestas().value
    }

    this.dialogRef.close(foro);
  }
}
