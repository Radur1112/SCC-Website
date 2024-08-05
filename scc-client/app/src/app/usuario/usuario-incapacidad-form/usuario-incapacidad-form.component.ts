import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { GenericService } from '../../services/generic.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ForoSubirArchivoComponent } from "../../foro/foro-subir-archivo/foro-subir-archivo.component";

@Component({
  selector: 'app-usuario-incapacidad-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIconModule, MatTooltipModule, ForoSubirArchivoComponent],
  templateUrl: './usuario-incapacidad-form.component.html',
  styleUrl: './usuario-incapacidad-form.component.scss',
  providers: [DatePipe]
})
export class UsuarioIncapacidadFormComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  incapacidadForm: FormGroup;
  
  usuarioActual: any;

  sizeError: any;

  maxDate: Date;
  minDate: Date;

  @ViewChild(ForoSubirArchivoComponent) childComponent!: ForoSubirArchivoComponent;
  
  dateFilter = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    return day !== 0 && day !== 6;
  }

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _adapter: DateAdapter<any>,
  ) {
    this._locale = 'cr';
    this._adapter.setLocale(this._locale);

    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    this.maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    this.reactiveForm();
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
      } else {
        this.usuarioActual = null;
      }
    });
  }
  
  reactiveForm() {
    this.incapacidadForm = this.fb.group({
      razon: ['', [Validators.required, Validators.maxLength(250)]],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      archivo: [null]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.incapacidadForm.controls[control].hasError(error);
  };

  onArchivosSelected(archivos: any) {
    this.incapacidadForm.get('archivo').setErrors(null);

    archivos.forEach(archivo => {
      const maxSizeInBytes = 10 * 1024 * 1024; // Tamaño máximo de 10 MB
  
      this.sizeError = maxSizeInBytes / 1024 / 1024;
  
      if (archivo.size > maxSizeInBytes) {
        this.incapacidadForm.get('archivo').setErrors({'size': true});
      }
    });

    if (!this.incapacidadForm.get('archivo').getError('size')) {
      this.incapacidadForm.get('archivo').setValue(archivos);
    }
  }

  crearIncapacidad() {
    const data = {
      idUsuario: this.usuarioActual.id,
      razon: this.incapacidadForm.value.razon,
      fechaInicio: this.formatearFecha(this.incapacidadForm.value.fechaInicio),
      fechaFinal: this.formatearFecha(this.incapacidadForm.value.fechaFinal)
    }

    this.gService.post(`incapacidad`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.crearArchivos(res.data.insertId);
      }
    });
  }

  crearArchivos(idIncapacidad: any) {
    const formData = new FormData();
    formData.append('idIncapacidad', idIncapacidad,);

    if (this.incapacidadForm.value.archivo) {
      this.incapacidadForm.value.archivo.forEach((file, index) => {
        formData.append(`archivo`, file, file.name);
      });
    }

    this.gService.post(`incapacidad/archivos`, formData)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Justificación', 'Justificación enviada correctamente', TipoMessage.success);
        this.incapacidadForm.reset();
        if (this.childComponent) {
          this.childComponent.removeFiles();
        }
      }
    });
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}
