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
  selector: 'app-usuario-vacacion-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIconModule, MatTooltipModule, ForoSubirArchivoComponent],
  templateUrl: './usuario-vacacion-form.component.html',
  styleUrl: './usuario-vacacion-form.component.scss',
  providers: [DatePipe]
})
export class UsuarioVacacionFormComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  vacacionForm: FormGroup;
  
  usuarioActual: any;
  vacacionActual: any;

  maxDate: Date;
  minDate: Date;

  horaInicio: boolean = false;
  horaFinal: boolean = false;

  previewHoraInicio: any = '08:00';
  previewHoraFinal: any = '17:00';
  
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

    this.reactiveForm();
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
        this.getUsuario();
      } else {
        this.usuarioActual = null;
      }
    });
  }

  getUsuario() {
    this.gService.get(`usuario/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.vacacionActual = res.data.vacacion;

        const currentDate = new Date();
        this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        this.maxDate = this.getBussinesDiasAgregados(currentDate, parseInt(this.vacacionActual));
      }
    });
  }

  getBussinesDiasAgregados(fechaInicio: any, dias: any) {
    const date = new Date(fechaInicio);
    let agregados = 0;

    while (agregados < dias) {
      date.setDate(date.getDate() + 1);

      if (date.getDay() !== 0 && date.getDay() !== 6) { 
        agregados++;
      }
    }

    return date;
  } 
  
  reactiveForm() {
    this.vacacionForm = this.fb.group({
      comentario: ['', Validators.maxLength(250)],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      horaInicio: ['08:00'],
      horaFinal: ['17:00'],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.vacacionForm.controls[control].hasError(error);
  };

  verificarHora(inicio: boolean) {
    const horaInicio = this.vacacionForm.get('horaInicio');
    const horaFinal= this.vacacionForm.get('horaFinal');

    if (inicio) {
      if (horaInicio.value) {
        this.previewHoraInicio = this.validateTime(horaInicio.value);
      }
      horaInicio.setValue(this.previewHoraInicio);
    } else {
      if (horaFinal.value) {
        this.previewHoraFinal = this.validateTime(horaFinal.value);
      }
      horaFinal.setValue(this.previewHoraFinal);
    }
  }

  validateTime(valor: string): string {
    const [horas, minutos] = valor.split(':').map(Number);
    const hora = horas * 60 + minutos;
    const inicio = 8 * 60;
    const final = 17 * 60;
    const almu = 12 * 60;
    const erzo = 13 * 60;

    if (hora < inicio) {
      return '08:00';
    } else if (hora >= final) {
      return '17:00';
    } else if (hora > almu && hora < erzo) {
      return '12:00';
    }
    return valor;
  }

  crearVacacion() {
    const data = {
      idUsuario: this.usuarioActual.id,
      comentario: this.vacacionForm.value.comentario == '' ? null : this.vacacionForm.value.comentario,
      fechaInicio: this.formatearFecha(this.vacacionForm.value.fechaInicio, this.vacacionForm.value.horaInicio ?? '08:00'),
      fechaFinal: this.formatearFecha(this.vacacionForm.value.fechaFinal, this.vacacionForm.value.horaFinal ?? '17:00')
    }

    this.gService.post(`vacacion`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Vacacion', 'Solicitud de vacaciones enviada correctamente', TipoMessage.success);
        this.getUsuario();
        this.vacacionForm.reset();
        this.vacacionForm.get('horaInicio').setValue('08:00')
        this.vacacionForm.get('horaFinal').setValue('17:00')
        this.horaInicio = false;
        this.horaFinal = false;
      }
    });
  }

  formatearFecha(fecha: Date, hora: any): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hora}:00`;
  }
}
