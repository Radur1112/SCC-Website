import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-planilla-anotacion-form-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, MatTooltipModule, MatSelectModule, MatDialogModule],
  templateUrl: './planilla-anotacion-form-dialog.component.html',
  styleUrl: './planilla-anotacion-form-dialog.component.scss'
})
export class PlanillaAnotacionFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  anotacionForm: FormGroup;
  
  anotacion: any;
  tipos: any;

  idUsuarioActual: any;

  horasQuincena: any = 30 * 8 / 2;
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaAnotacionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idUsuarioActual = this.data.idUsuarioActual;
    this.anotacion = data.anotacion;
    console.log(this.anotacion.monto / (this.anotacion.usuarioSalario / (this.horasQuincena) * (this.anotacion.valorHoras)))
    this.reactiveForm();
  }
  
  reactiveForm() {
    this.anotacionForm = this.fb.group({
      descripcion: [this.anotacion.descripcion, [Validators.required, Validators.maxLength(100)]],
      hora: [null],
      monto: [this.anotacion.monto, Validators.required]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.anotacionForm.controls[control].hasError(error);
  };

  calcularMonto() {
    const hora = this.anotacionForm.get('hora')?.value;
    const monto = this.anotacionForm.get('monto');

    if (hora) {
      const [hours, minutes] = hora.split(':').map(Number);
      const horasTotales = hours + minutes / 60;

      const salarioXhora = this.anotacion.usuarioSalario / (this.horasQuincena) * (this.anotacion.valorHoras);

      monto.setValue((horasTotales * salarioXhora).toFixed(2));
    }
  }

  guardarAnotacion() {
    const data = {
      id: this.anotacion.id,
      idPlanilla: this.anotacion.idPlanilla,
      idTipo: this.anotacion.idTipo,
      descripcion: this.anotacionForm.value.descripcion,
      monto: this.anotacionForm.value.monto,
      idUsuario: this.idUsuarioActual
    }
    
    this.gService.put(`${transformarTipo(this.anotacion.tipo)}`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Anotacion', 'Anotacion modificada correctamente', TipoMessage.success);
        this.dialogRef.close(true);
      }
    });
  }
}

function transformarTipo(input) {
  let lowerCaseStr = input.toLowerCase();

  let words = lowerCaseStr.split(' ');

  for (let i = 1; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1);
  }

  return words.join('');
}
