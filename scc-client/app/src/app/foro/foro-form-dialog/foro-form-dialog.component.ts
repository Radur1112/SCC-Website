import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
@Component({
  selector: 'app-foro-form-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule, MatDialogModule, MatSelectModule, ForoSubirArchivoComponent],
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

  selectedArchivos: File[] = [];
  
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
    this.selectedArchivos = archivos;
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
      archivos: this.selectedArchivos
    }

    this.dialogRef.close(foro);
  }
}
