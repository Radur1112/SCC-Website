import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-capacitacion-admin-modulo-form-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule, MatDialogModule, MatIconModule],
  templateUrl: './capacitacion-admin-modulo-form-dialog.component.html',
  styleUrl: './capacitacion-admin-modulo-form-dialog.component.scss'
})
export class CapacitacionAdminModuloFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  moduloForm: FormGroup;
  tituloForm: any;

  crear: any;
  idModulo: any;
  
  constructor(
    private gService: GenericService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CapacitacionAdminModuloFormDialogComponent>,
    private fb: FormBuilder
  ) {
    this.crear = this.data.crear;
    this.idModulo = this.data.idModulo;

    this.formularioReactive();
  }

  ngOnInit(): void {
      if (this.crear) {
        this.tituloForm = 'Crear';
      } else {
        this.tituloForm = 'Actualizar';
        this.cargarDatos();
      }
  }

  cargarDatos() {
    this.gService.get(`modulo/${this.idModulo}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.moduloForm.setValue({
          id: res.data.id,
          titulo: res.data.titulo,
          descripcion: res.data.descripcion,
        })
      }
    });
  }
  
  formularioReactive() {
    this.moduloForm = this.fb.group({
      id: [null],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(3000)]],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.moduloForm.controls[control].hasError(error);
  };

  returnModulo() {
    if (this.moduloForm.invalid) {
      return; 
    }

    this.dialogRef.close(this.moduloForm.value);
  }
  
}
