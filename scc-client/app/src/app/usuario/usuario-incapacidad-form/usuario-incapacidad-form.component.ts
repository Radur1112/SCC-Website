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
import { AlertaService, TipoMessage } from '../../services/alerta.service';
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
  incapacidadesSolicitadas: any = '0.00';

  sizeError: any;

  maxDate: Date;
  minDate: Date;
  maxHourInicio: string;
  minHourInicio: string;
  maxHourFinal: string;
  minHourFinal: string;

  incapacidades: any[] = [];


  horaEntrada: string = '08:00';
  horaEntradaHoras: number = parseInt(this.horaEntrada.split(':')[0]);
  horaEntradaMinutos: number = parseInt(this.horaEntrada.split(':')[1]);
  horaEntradaEnMinutos: number = this.horaEntradaHoras * 60 + this.horaEntradaMinutos;

  horaSalida: string = '17:00';
  horaSalidaHoras: number = parseInt(this.horaSalida.split(':')[0]);
  horaSalidaMinutos: number = parseInt(this.horaSalida.split(':')[1]);
  horaSalidaEnMinutos: number = this.horaSalidaHoras * 60 + this.horaSalidaMinutos;

  almuerzoEntrada: string = '12:00';
  almuerzoEntradaHoras: number = parseInt(this.almuerzoEntrada.split(':')[0]);
  almuerzoEntradaMinutos: number = parseInt(this.almuerzoEntrada.split(':')[1]);
  almuerzoEntradaEnMinutos: number = this.almuerzoEntradaHoras * 60 + this.almuerzoEntradaMinutos;

  almuerzoSalida: string = '13:00';
  almuerzoSalidaHoras: number = parseInt(this.almuerzoSalida.split(':')[0]);
  almuerzoSalidaMinutos: number = parseInt(this.almuerzoSalida.split(':')[1]);
  almuerzoSalidaEnMinutos: number = this.almuerzoSalidaHoras * 60 + this.almuerzoSalidaMinutos;
  
  horasTrabajoEnMinutos = this.horaSalidaEnMinutos - this.horaEntradaEnMinutos - (this.almuerzoSalidaEnMinutos - this.almuerzoEntradaEnMinutos);
  horasTrabajo = this.horasTrabajoEnMinutos / 60;

  previewHoraInicio: string = this.horaEntrada;
  previewHoraFinal: string =  this.horaSalida;

  horasDisponiblesInicio: any = [];
  horasDisponiblesFinal: any = [];

  fechaRepetida: Date;

  @ViewChild(ForoSubirArchivoComponent) childComponent!: ForoSubirArchivoComponent;
  
  dateFilter = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    return day !== 0;
  }

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
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
        this.getIncapacidades();
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
      horaInicio: [this.horaEntrada],
      horaFinal: [this.horaSalida],
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

  getIncapacidades() {
    this.gService.get(`incapacidad/noRechazado/usuario/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.incapacidades = res.data;
        this.restartLimit();
      }
    });
  }

  restartLimit() {
    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate());
    this.maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
  
    this.dateFilter = this.createDateFilter();
  }
  
  private createDateFilter(): (date: Date | null) => boolean {
    return (date: Date | null): boolean => {
      if (!date) return true;
      if (date.getDay() === 0) return false;
  
      const dateTimestamp = this.setMidnight(date).getTime();
  
      return !this.incapacidades.some(incapacidad => {
        const fechaInicio = new Date(incapacidad.fechaInicio);
        const fechaFinal = new Date(incapacidad.fechaFinal);
  
        const fechaInicioTimestamp = this.setMidnight(fechaInicio).getTime();
        const fechaFinalTimestamp = this.setMidnight(fechaFinal).getTime();
  
        if (dateTimestamp < fechaInicioTimestamp || dateTimestamp > fechaFinalTimestamp) {
          return false;
        }
  
        const inicioMinutos = fechaInicio.getHours() * 60 + fechaInicio.getMinutes();
        const finalMinutos = fechaFinal.getHours() * 60 + fechaFinal.getMinutes();
        
        if (dateTimestamp === fechaInicioTimestamp && inicioMinutos > this.horaEntradaEnMinutos) {
          if (this.validateDia(fechaInicio)) {
            return true;
          }
          return false;
        }
  
        if (dateTimestamp === fechaFinalTimestamp && finalMinutos < this.horaSalidaEnMinutos) {
          if (this.validateDia(fechaFinal)) {
            return true;
          }
          return false;
        }
  
        return true;
      });
    };
  }
  

  validateDia(fecha: Date) {
    const fechasRepetidas = this.createRepetidas(fecha);
    if (fechasRepetidas.length < 2) return false;
    
    let minutosTotales = new Array(this.horaEntradaEnMinutos).fill(false);

    fechasRepetidas.forEach(fecha => {
      const fechaInicio = fecha.fechaInicio;
      const fechaFinal = fecha.fechaFinal;
      let inicioMinutos = fechaInicio.getHours() * 60 + fechaInicio.getMinutes();
      let finalMinutos = fechaFinal.getHours() * 60 + fechaFinal.getMinutes();
      
      if (this.setMidnight(fechaInicio) < this.fechaRepetida) {
        inicioMinutos = this.horaEntradaEnMinutos;
      }
      if (this.setMidnight(fechaFinal) > this.fechaRepetida) {
        finalMinutos = this.horaSalidaEnMinutos;
      }

      inicioMinutos = Math.max(inicioMinutos, this.horaEntradaEnMinutos);
      finalMinutos = Math.min(finalMinutos, this.horaSalidaEnMinutos);

      for (let i = inicioMinutos; i < finalMinutos; i++) {
        if (i < this.almuerzoEntradaEnMinutos) {
          minutosTotales[i - this.horaEntradaEnMinutos] = true;
        } else if (i >= this.almuerzoSalidaEnMinutos) {
          minutosTotales[i - this.horaEntradaEnMinutos   - (this.almuerzoSalidaEnMinutos - this.almuerzoEntradaEnMinutos)] = true;
        }
      }
    });

    return minutosTotales.every(minuto => minuto === true);
  }

  getDays(fechaInicio: Date, fechaFinal: Date) {
    const fechaInicioSinHoras = new Date(fechaInicio);
    fechaInicioSinHoras.setHours(0, 0, 0, 0);
    const fechaFinalSinHoras = new Date(fechaFinal);
    fechaFinalSinHoras.setHours(0, 0, 0, 0);
    let currentDateSinHoras = new Date(fechaInicioSinHoras);
    
    let totalHoras = 0;

    while (currentDateSinHoras <= fechaFinalSinHoras) {
      if (currentDateSinHoras.getDay() !== 0) {
        totalHoras += this.horasTrabajo;

        if (currentDateSinHoras.getTime() == fechaInicioSinHoras.getTime()) {
          let horas = fechaInicio.getHours() - this.horaEntradaHoras;
          if (fechaInicio.getHours() > this.almuerzoEntradaHoras) {
            horas--;
          }

          totalHoras -= horas + (fechaInicio.getMinutes() / 60);
        } 
        
        if (currentDateSinHoras.getTime() == fechaFinalSinHoras.getTime()) {
          let horas = this.horaSalidaHoras - fechaFinal.getHours();
          if (fechaFinal.getHours() < this.almuerzoSalidaHoras) {
            horas--;
          }

          totalHoras -= horas - (1 - (60 - fechaFinal.getMinutes()) / 60);
        } 
      }
      currentDateSinHoras.setDate(currentDateSinHoras.getDate() + 1);
    }
    const totalDias = totalHoras / 8;

    return totalDias.toFixed(2);
  }
  
  private setMidnight(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  createRepetidas(fecha: Date): any[] {
    const fechasRepetidas = [];

    this.incapacidades.forEach(incapacidad => {
      const fechaInicio = new Date(incapacidad.fechaInicio);
      const fechaFinal = new Date(incapacidad.fechaFinal);
      
      if (fechaInicio.toDateString() === fecha.toDateString() && fechaFinal.toDateString() !== fecha.toDateString()) {
        fechasRepetidas.push({fechaInicio, fechaFinal}); 
        this.fechaRepetida = this.setMidnight(fechaInicio);
      } else if (fechaInicio.toDateString() !== fecha.toDateString() && fechaFinal.toDateString() === fecha.toDateString()) {
        fechasRepetidas.push({fechaInicio, fechaFinal}); 
        this.fechaRepetida = this.setMidnight(fechaFinal);
      } else if (fechaInicio.toDateString() === fecha.toDateString() && fechaFinal.toDateString() === fecha.toDateString()) {
        fechasRepetidas.push({fechaInicio, fechaFinal}); 
        this.fechaRepetida = this.setMidnight(fechaFinal);
      }
    });
    fechasRepetidas.sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime());

    return fechasRepetidas;
  }


  onClosedDatePicker() {
    const fechaInicio = this.incapacidadForm.get('fechaInicio');
    const fechaFinal = this.incapacidadForm.get('fechaFinal');
    const horaInicio = this.incapacidadForm.get('horaInicio');
    const horaFinal= this.incapacidadForm.get('horaFinal');

    if (fechaInicio && fechaInicio.value && !fechaFinal.value) {
      fechaFinal.setValue(fechaInicio.value)
    }

    if (fechaInicio && fechaInicio.value && fechaFinal && fechaFinal.value) {
      this.horasDisponiblesInicio = this.getDiasDisponibles(fechaInicio.value);
      this.horasDisponiblesFinal = this.getDiasDisponibles(fechaFinal.value);

      if (this.setMidnight(fechaInicio.value).getTime() != this.setMidnight(fechaFinal.value).getTime()) {
        this.horasDisponiblesInicio = this.horasDisponiblesInicio.filter(h => h.endsWith(this.horaSalida))
        this.horasDisponiblesFinal = this.horasDisponiblesFinal.filter(h => h.startsWith(this.horaEntrada))
      }
      
      if (this.horasDisponiblesInicio?.length > 0) {
        let hora = this.horasDisponiblesInicio[0].split(' - ')[0];
        this.previewHoraInicio = hora;
        horaInicio.setValue(hora);
      } else {
        this.previewHoraInicio = this.horaEntrada;
        horaInicio.setValue(this.horaEntrada);
      }
      if (this.horasDisponiblesFinal?.length > 0){
        let hora = this.horasDisponiblesFinal[0].split(' - ')[1];
        this.previewHoraFinal = hora;
        horaFinal.setValue(hora);
      } else {
        this.previewHoraFinal = this.horaSalida;
        horaFinal.setValue(this.horaSalida);
      }

      this.incapacidadesSolicitadas = this.getDays(fechaInicio.value, fechaFinal.value)
    } else {
      this.incapacidadesSolicitadas = null;
    }

    this.restartLimit();
  }

  validateLimit() {
    const fechaInicio = this.incapacidadForm.get('fechaInicio');

    if (fechaInicio && fechaInicio.value) {
      const newIncapacidades = this.incapacidades.filter(v => new Date(v.fechaInicio) > fechaInicio.value);
      let newMaxDate: Date;

      newMaxDate = new Date(fechaInicio.value.getFullYear() + 1, fechaInicio.value.getMonth(), fechaInicio.value.getDate());

      if (this.getDiasDisponibles(newMaxDate).find(h => h.endsWith(this.horaSalida))){ 
        for (const incapacidad of newIncapacidades) {
          if (fechaInicio.value < this.setMidnight(new Date(incapacidad.fechaFinal)) && newMaxDate >= this.setMidnight(new Date(incapacidad.fechaInicio))) {
            newMaxDate = new Date(incapacidad.fechaInicio);

            if (!this.getDiasDisponibles(newMaxDate).find(h => h.startsWith(this.horaEntrada))){ 
              newMaxDate.setDate(newMaxDate.getDate() - 1);
            }

            break;
          }
        }
      }
      this.minDate = new Date(fechaInicio.value);
      this.maxDate = new Date(newMaxDate);
    }
  }

  getDiasDisponibles(fechaEspecifica: Date) {
    const horasDisponibles = [];
    const vacacionesFecha = this.createRepetidas(fechaEspecifica);

    const inicioDia = new Date(fechaEspecifica);
    inicioDia.setHours(this.horaEntradaHoras, this.horaEntradaMinutos, 0, 0);
    
    const finalDia = new Date(fechaEspecifica);
    finalDia.setHours(this.horaSalidaHoras, this.horaSalidaMinutos, 0, 0);

    let ultimaHora = inicioDia;

    vacacionesFecha.forEach(fecha => {
      const fechaInicio = fecha.fechaInicio;
      const fechaFinal = fecha.fechaFinal;

      if (fechaInicio > ultimaHora) {
        horasDisponibles.push(
        `${this.addZeros(ultimaHora.getHours())}:${this.addZeros(ultimaHora.getMinutes())} - ${this.addZeros(fechaInicio.getHours())}:${this.addZeros(fechaInicio.getMinutes())}`
        );
      }
    
      ultimaHora = fechaFinal > ultimaHora ? fechaFinal : ultimaHora;
    });
    
    if (ultimaHora < finalDia) {
      horasDisponibles.push(
        `${this.addZeros(ultimaHora.getHours())}:${this.addZeros(ultimaHora.getMinutes())} - ${this.addZeros(finalDia.getHours())}:${this.addZeros(finalDia.getMinutes())}`
      );
    }

    return horasDisponibles;
  }

  addZeros(value: string | number, padLength: number = 2): string {
    const stringValue = String(value);
    
    return stringValue.padStart(padLength, '0');
  }

  getBusinessDays(startDate: Date, days: number) {
    let count = 0;
    let currentDate = new Date(startDate);

    while (days >= 1) {
        count++;
        if (currentDate.getDay() !== 0) {
          days--;
        }

        if (days == 0 && currentDate.getDay() == 6) {
          count++;
        } 
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }

  verificarHora(inicio: boolean) {
    const fechaInicio = this.incapacidadForm.get('fechaInicio');
    const fechaFinal = this.incapacidadForm.get('fechaFinal');
    const horaInicio = this.incapacidadForm.get('horaInicio');
    const horaFinal= this.incapacidadForm.get('horaFinal');

    if (inicio) {
      if (horaInicio.value) {
        this.previewHoraInicio = this.validateTime(horaInicio.value, this.horasDisponiblesInicio, inicio);
      }
      horaInicio.setValue(this.previewHoraInicio);
    } else {
      if (horaFinal.value) {
        this.previewHoraFinal = this.validateTime(horaFinal.value, this.horasDisponiblesFinal, inicio);
      }
      horaFinal.setValue(this.previewHoraFinal);
    }

    if (horaInicio && horaInicio.value && horaFinal && horaFinal.value) {
      if (this.validateIntervalSameDay(this.timeToMinutes(horaInicio.value), this.timeToMinutes(horaFinal.value))) {
        horaFinal.setErrors({'interval': true});
      } else {
        horaFinal.setErrors(null);
      }

      if (fechaInicio && fechaInicio.value && fechaFinal && fechaFinal.value) {
        const fechaI = new Date(fechaInicio.value);
        fechaI.setHours(horaInicio.value.split(':')[0], horaInicio.value.split(':')[1], 0, 0);
        const fechaF = new Date(fechaFinal.value);
        fechaF.setHours(horaFinal.value.split(':')[0], horaFinal.value.split(':')[1], 0, 0);

        this.incapacidadesSolicitadas = this.getDays(fechaI, fechaF)
      }
    }
  }

  validateTime(valor: string, horasDisponibles: any[], inicio: boolean): string {
    const horaMinutos = this.timeToMinutes(valor);

    if (horaMinutos < this.horaEntradaEnMinutos) {
      return this.horaEntrada;
    } else if (horaMinutos > this.horaSalidaEnMinutos) {
      return this.horaSalida;
    } else if (horaMinutos > this.almuerzoEntradaEnMinutos && horaMinutos < this.almuerzoSalidaEnMinutos) {
      return this.almuerzoEntrada;
    }
    
    for (const disponible of horasDisponibles) {
      const disponibleMinutosInicio = this.timeToMinutes(disponible.split(' - ')[0]);
      const disponibleMinutosFinal = this.timeToMinutes(disponible.split(' - ')[1]);

      if (horaMinutos >= disponibleMinutosInicio && horaMinutos <= disponibleMinutosFinal ) {
        return valor;
      }
    }

    return inicio ? horasDisponibles[0].split(' - ')[0] : horasDisponibles[0].split(' - ')[1];
  }

  validateIntervalSameDay(inicioMinutos: number, finalMinutos: number) {
    const fechaInicio = this.incapacidadForm.get('fechaInicio');
    const fechaFinal = this.incapacidadForm.get('fechaFinal');

    if (fechaInicio && fechaInicio.value && fechaFinal && fechaFinal.value) {
      if (this.setMidnight(fechaInicio.value).getTime() == this.setMidnight(fechaFinal.value).getTime()) {
        for (const disponible of this.horasDisponiblesInicio) {
          const disponibleMinutosInicio = this.timeToMinutes(disponible.split(' - ')[0]);
          const disponibleMinutosFinal = this.timeToMinutes(disponible.split(' - ')[1]);
    
          if (inicioMinutos >= disponibleMinutosInicio && inicioMinutos <= disponibleMinutosFinal &&
          finalMinutos >= disponibleMinutosInicio && finalMinutos <= disponibleMinutosFinal) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };


  crearIncapacidad() {
    const data = {
      idUsuario: this.usuarioActual.id,
      razon: this.incapacidadForm.value.razon,
      fechaInicio: this.formatearFecha(this.incapacidadForm.value.fechaInicio, this.incapacidadForm.value.horaInicio ?? this.horaEntrada),
      fechaFinal: this.formatearFecha(this.incapacidadForm.value.fechaFinal, this.incapacidadForm.value.horaFinal ?? this.horaSalida)
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
        this.alerta.mensaje('Justificación', 'Justificación enviada correctamente', TipoMessage.success);
        this.incapacidadForm.reset();
        this.incapacidadForm.get('horaInicio').setValue(this.horaEntrada)
        this.incapacidadForm.get('horaFinal').setValue(this.horaSalida)
        this.getIncapacidades();
        this.incapacidadesSolicitadas = 0;
        if (this.childComponent) {
          this.childComponent.removeFiles();
        }
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
