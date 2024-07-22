import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { ProvinciasService } from '../../services/provincias.service';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { GenericService } from '../../services/generic.service';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'app-reclutamiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatRadioModule],
  templateUrl: './reclutamiento.component.html',
  styleUrl: './reclutamiento.component.scss',
  providers: [DatePipe]
})
export class ReclutamientoComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  reclutamientoForm: FormGroup;
  textoExperiencia: any = 'No';
  sizeError: any;

  provincias: any;
  cantones: any;
  distritos: any;

  maxDate: Date;
  minDate: Date;
  
  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private datePipe: DatePipe,
    private gService: GenericService,
    private pServicio: ProvinciasService,
    private notificacion: NotificacionService,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _adapter: DateAdapter<any>,
  ) {
    this._locale = 'cr';
    this._adapter.setLocale(this._locale);

    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear() - 100, currentDate.getMonth(), currentDate.getDate());
    this.maxDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());

    this.reactiveForm();
  }
  
  reactiveForm() {
    this.reclutamientoForm = this.fb.group({
      identificacion: ['',[Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      telefono: ['', [Validators.required, , Validators.pattern(/^(\d{4})-(\d{4})$/)]],
      provincia: ['', Validators.required],
      canton: [{ value: null, disabled: true }, Validators.required],
      distrito:  [{ value: null, disabled: true }, Validators.required],
      fecha:  ['', Validators.required],
      tieneExperiencia: [null],
      tiempoExperiencia: [{ value: null, disabled: true }],
      trabajo: ['', Validators.required],
      cv: ['', Validators.required],
      comentario: ['', Validators.maxLength(999)]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.reclutamientoForm.controls[control].hasError(error);
  };

  ngOnInit(): void {
    this.loadProvincias();
  }

  formatearTelefono() {
    const telefono = this.reclutamientoForm.get('telefono');

    //Remover no digitos de telefono
    const digitos = telefono.value.replace(/\D/g, '');
    
    //Agregar guión si hay más de 4 dígitos
    let res = '';
    if (digitos.length > 4) {
      res = digitos.slice(0, 4) + '-' + digitos.slice(4, 8);
    } else {
      res = digitos;
    }

    //Actualizar valor
    telefono.setValue(res);
  }

  loadProvincias() {
    this.pServicio.getProvincias().pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.provincias = data;
    });
  }

  loadCantones(COD_PROV: string) {
    this.pServicio.getCantonesPorProvincia(COD_PROV).pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.cantones = data;
      this.distritos = [];
    });
  }

  loadDistritos(COD_PROV: string, COD_Cant: string) {
    this.pServicio.getDistritosPorCantonProvincia(COD_PROV, COD_Cant).pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.distritos = data;
    });
  }

  onProvinciaChange() {
    const COD_PROV = this.reclutamientoForm.get('provincia').value.COD_PROV;
    this.loadCantones(COD_PROV);

    const canton = this.reclutamientoForm.get('canton');
    canton.setValue('');
    canton.enable();

    const distrito = this.reclutamientoForm.get('distrito');
    distrito.setValue('');
    distrito.disable();
  }

  onCantonChange() {
    const COD_PROV = this.reclutamientoForm.get('provincia').value.COD_PROV;
    const COD_CANT = this.reclutamientoForm.get('canton').value.COD_CANT;
    this.loadDistritos(COD_PROV, COD_CANT);

    const distrito = this.reclutamientoForm.get('distrito');
    distrito.setValue('');
    distrito.enable();
  }
  

  tieneExperiencia(event: any) {
    const experiencia = event.value;
    const tiempoExpecienciaControl = this.reclutamientoForm.get('tiempoExperiencia');

    if (experiencia) {
      tiempoExpecienciaControl.enable();
      tiempoExpecienciaControl.setValue('1-3');
    } else {
      tiempoExpecienciaControl.reset();
      tiempoExpecienciaControl.disable();
    }
  }


  seleccionarArchivo(event: any) {
    const archivo = event.target.files[0];
    const maxSizeInBytes = 10 * 1024 * 1024; // Tamaño máximo de 10 MB

    this.sizeError = maxSizeInBytes/1024/1024;

    if (archivo.size > maxSizeInBytes) {
      this.reclutamientoForm.get('cv').setErrors({'size': true});
    } else {
      this.reclutamientoForm.get('cv').setErrors(null);

      this.reclutamientoForm.patchValue({ cv: archivo });
    }
  }

  enviarReclutamiento(){
    if(this.reclutamientoForm.invalid){
      return;
    }
    const formData = new FormData();

    formData.append('asunto', this.crearAsunto());
    formData.append('identificacion', this.reclutamientoForm.get('identificacion').value);
    formData.append('nombre', this.reclutamientoForm.get('nombre').value);
    formData.append('correo', this.reclutamientoForm.get('correo').value);
    formData.append('telefono', this.reclutamientoForm.get('telefono').value);
    formData.append('direccion', this.crearDireccion());
    formData.append('fecha', this.datePipe.transform(this.reclutamientoForm.get('fecha').value, 'dd/MM/yyyy'));
    formData.append('experiencia', this.reclutamientoForm.get('tiempoExperiencia').value);
    formData.append('cv', this.reclutamientoForm.get('cv').value);
    formData.append('comentario', this.reclutamientoForm.get('comentario').value);

    this.gService.post(`reclutamiento`, formData).subscribe(response => {
      this.notificacion.mensaje('Información', response.toString(), TipoMessage.success);
      this.resetForm();
    });
  }

  crearAsunto() {
    let asunto = this.reclutamientoForm.value.tieneExperiencia ? "Con Experiencia " : "Sin Experiencia ";
    switch(this.reclutamientoForm.value.trabajo) {
      case 'cobros':
        asunto += "Cobros"
        break;
      case 'servicio':
        asunto += "Servicio al cliente"
        break;
        case 'ventas':
          asunto += "Ventas"
          break;
      case 'domiciliario':
        asunto += "Cobrador domiciliario (D2D)"
        break;
      default:
    }
    return asunto;
  }

  crearDireccion() {
    return this.reclutamientoForm.get('distrito').value.NOM_DIST + ', ' 
    + this.reclutamientoForm.get('canton').value.NOM_CANT + ', '
    + this.reclutamientoForm.get('provincia').value.NOM_PROV;
  }

  resetForm() {
    this.reclutamientoForm.reset({
      provincia: null,
      canton: { value: null, disabled: true },
      distrito: { value: null, disabled: true },
      tieneExperiencia: "",
      tiempoExperiencia: { value: null, disabled: true }
    });
  }
}
