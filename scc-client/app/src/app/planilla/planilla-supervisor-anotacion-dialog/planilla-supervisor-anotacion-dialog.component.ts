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
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-planilla-supervisor-anotacion-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, MatTooltipModule, MatSelectModule, MatDialogModule],
  templateUrl: './planilla-supervisor-anotacion-dialog.component.html',
  styleUrl: './planilla-supervisor-anotacion-dialog.component.scss'
})
export class PlanillaSupervisorAnotacionDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  anotacionForm: FormGroup;
  
  planilla: any;
  tipos: any;
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.planilla = data.planilla;
    this.reactiveForm();
    this.getTipos();
  }
  
  reactiveForm() {
    this.anotacionForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      hora: [null],
      monto: ['', Validators.required]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.anotacionForm.controls[control].hasError(error);
  };

  getTipos() {
    this.gService.get(`planilla/tipos`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipos = res.data;
      }
    });
  }

  calcularMonto() {
    const tipo = this.anotacionForm.get('tipo')?.value;
    const hora = this.anotacionForm.get('hora')?.value;
    const monto = this.anotacionForm.get('monto');

    if (hora) {
      const [hours, minutes] = hora.split(':').map(Number);
      const horasTotales = hours + minutes / 60;

      const salarioXhora = this.planilla.salarioBase / 160 * (tipo.descripcion == 'Horas Extra' ? 2 : 1);

      monto.setValue((horasTotales * salarioXhora).toFixed(2));
    }
  }

  guardarAnotacion() {
    console.log('xd');
  }
}
