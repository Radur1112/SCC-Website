import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UsuarioRegistrarDialogComponent } from '../usuario-registrar-dialog/usuario-registrar-dialog.component';
import { NotificacionService, TipoMessage } from '../../services/notification.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIconModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
  providers: [DatePipe]
})
export class UsuarioFormComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  usuarioForm: FormGroup;
  archivoForm: FormGroup;
  tituloForm: string;
  usuarioId: any;
  esCrear: boolean;

  sizeError: any;

  tipoUsuarios: any;
  tipoContratos: any;

  maxDate: Date;
  minDate: Date;

  nombreArchivo: any;
  
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
    this.minDate = new Date(currentDate.getFullYear() - 30, currentDate.getMonth(), currentDate.getDate());
    this.maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, currentDate.getDate());

    this.getTipoUsuarios();
    this.getTipoContratos();


    this.reactiveForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.usuarioId = params.get('id');
      this.esCrear = this.usuarioId === null;

      if (this.esCrear) {
        this.tituloForm = 'Registrar';
      } else {
        this.tituloForm = 'Actualizar';
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    this.gService.get(`usuario/${this.usuarioId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.usuarioForm.setValue({
          id: res.data.Id,
          identificacion: res.data.Identificacion,
          correo: res.data.Correo,
          password: '********',
          nombre: res.data.Nombre,
          apellidos: res.data.Apellidos,
          salario: res.data.Salario,
          fechaIngreso: res.data.FechaIngreso,
          cantVacacion: res.data.CantVacacion,
          idTipoUsuario: res.data.IdTipoUsuario,
          idTipoContrato: res.data.IdTipoContrato,
          estado: res.data.Estado
        })
        const password = this.usuarioForm.get('password');
        password.disable();
        this.onTipoUsuarioChange();
        this.onTipoContratoChange();
      }
    });
  }
  
  reactiveForm() {
    this.usuarioForm = this.fb.group({
      id: [null],
      identificacion: ['', [Validators.required, Validators.maxLength(20)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      password: ['', [Validators.required, Validators.maxLength(60)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(150)]],
      salario: [{ value: null, disabled: true }, [Validators.required, Validators.min(100), Validators.max(999999999), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      fechaIngreso:  [{ value: null, disabled: true }, Validators.required],
      cantVacacion:  [{ value: null, disabled: true }, [Validators.required, Validators.min(0), Validators.max(99)]],
      idTipoUsuario: ['', Validators.required],
      idTipoContrato: [{ value: null, disabled: true }, Validators.required],
      estado: [null]
    });

    this.archivoForm = this.fb.group({
      archivo: [null, Validators.required],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.usuarioForm.controls[control].hasError(error);
  };
  
  public errorHandlingArchivo = (control: string, error: string) => {
    return this.archivoForm.controls[control].hasError(error);
  };

  getTipoUsuarios() {
    this.gService.get('tipoUsuario')
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipoUsuarios = res.data;
      },
      error:(err) => {
        console.log(err);
      }
    });
  }

  getTipoContratos() {
    this.gService.get('tipoContrato')
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipoContratos = res.data;
      },
      error:(err) => {
        console.log(err);
      }
    });
  }

  onIdentificacionChange() {
    const identificacion = this.usuarioForm.get('identificacion').value;
    const password = this.usuarioForm.get('password');

    password.setValue(identificacion);
  }

  onTipoUsuarioChange() {
    const tipoUsuario = this.usuarioForm.get('idTipoUsuario').value;

    const tipoContrato = this.usuarioForm.get('idTipoContrato');
    const cantVacacion = this.usuarioForm.get('cantVacacion');
    const fechaIngreso = this.usuarioForm.get('fechaIngreso');
    const salario = this.usuarioForm.get('salario');

    if (tipoUsuario != 1) {
      tipoContrato.enable();
      fechaIngreso.enable();
      if (!fechaIngreso.value) {
        fechaIngreso.setValue(new Date());
      }
      salario.enable();
    } else {
      tipoContrato.disable();
      cantVacacion.disable();
      fechaIngreso.disable();
      salario.disable();
    }
  }

  onTipoContratoChange() {
    const tipoContrato = this.usuarioForm.get('idTipoContrato').value;
    const cantVacacion = this.usuarioForm.get('cantVacacion');

    if (tipoContrato == 1) {
      cantVacacion.enable();
      if (!cantVacacion.value) {
        cantVacacion.setValue(0);
      }
    } else {
      cantVacacion.disable();
    }
  }

  cambiarPassword(checked: any) {
    const password = this.usuarioForm.get('password');
    
    if (checked) {
      password.enable();
      password.setValue(null);
    } else {
      password.disable();
      password.setValue('********');
    }
  }

  formatearSalario() {
    const salario = this.usuarioForm.get('salario');

    // Obtener el valor numérico del campo, eliminando caracteres no numéricos excepto el punto decimal
    const valorNumerico = parseFloat(salario.value.replace(/[^\d.]/g, ''));
    
    // Si el valor es un número válido, formatearlo con dos decimales
    if (!isNaN(valorNumerico)) {
      salario.setValue(valorNumerico.toFixed(2));
    } else {
      salario.setValue('');
    }
  }

  registrarUsuario() {
    if (this.usuarioForm.invalid) {
      return; 
    }

    const fechaIngreso = this.usuarioForm.get('fechaIngreso');

    if (fechaIngreso && fechaIngreso.value && !fechaIngreso.disabled) {
      this.usuarioForm.value.fechaIngreso = this.formatearFecha(new Date(this.usuarioForm.value.fechaIngreso));
    }

    this.authService.registrarUsuario(this.usuarioForm.value)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Usuario', 'Usuario registrado correctamente', TipoMessage.success);
        this.usuarioForm.reset();
        this.router.navigate(['usuario']);
      },
      error:(err) => {
        console.log(err);
      }
    });
  }

  actualizarUsuario() {
    if (this.usuarioForm.invalid) {
      return; 
    }

    const fechaIngreso = this.usuarioForm.get('fechaIngreso');

    if (fechaIngreso && fechaIngreso.value && !fechaIngreso.disabled) {
      this.usuarioForm.value.fechaIngreso = this.formatearFecha(new Date(this.usuarioForm.value.fechaIngreso));
    }

    this.gService.put('usuario', this.usuarioForm.value)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Usuario', 'Usuario actualizado correctamente', TipoMessage.success);
        this.usuarioForm.reset();
        this.router.navigate(['usuario']);
      },
      error:(err) => {
        console.log(err);
      }
    });
    
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }


  seleccionarArchivo(event: any) {
    const archivo = event.target.files[0];
    
    if (archivo) {
      this.nombreArchivo = archivo ? archivo.name : '';
  
      const maxSizeInBytes = 5 * 1024 * 1024 * 1024; // Tamaño máximo de 5 GB
  
      this.sizeError = maxSizeInBytes/1024/1024;
  
      if (archivo.size > maxSizeInBytes) {
        this.archivoForm.get('archivo').setErrors({'size': true});
      } else {
        this.archivoForm.get('archivo').setErrors(null);
  
        this.archivoForm.patchValue({ archivo: archivo });
      }
    }
  }

  subirUsuarios() {
    const formData = new FormData();
    formData.append('archivo', this.archivoForm.value.archivo);

    this.gService.post(`usuario/registrar/verificar`, formData)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.errors && res.errors.nombreColumnaExcel) {
          const nombreColumnas = Object.values(res.errors.nombreColumnaExcel);
          const errores = nombreColumnas.join(' <br> ');

          this.notificacion.mensaje('Error de en los nombres de las columnas', errores, TipoMessage.error);
        } else {
          this.openUsuarioRegistrarDialog(res);
        }
      },
      error: (err) => { 
        this.archivoForm.reset();
        this.nombreArchivo = '';
      }
    });
  }

  openUsuarioRegistrarDialog(res: any): void {
    let width = '1400px';
    let data = { 
      data: res,
    };
    
    const dialogRef = this.dialog.open(UsuarioRegistrarDialogComponent, {
      data,
      width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (let item of result) {
          const tipoUsuarioDescripcion = item.TipoUsuario;
          const tipoContratoDescripcion = item.TipoContrato;

          const tipoUsuarioId = this.obtenerTipoUsuarioId(tipoUsuarioDescripcion);
          const tipoContratoId = this.obtenerTipoContratoId(tipoContratoDescripcion);
          
          if (tipoUsuarioId) {
              item.IdTipoUsuario = tipoUsuarioId;
          }
          if (tipoContratoId) {
              item.IdTipoContrato = tipoContratoId;
          }
        }

        this.subirMultiples(result);
      }
    });
  }

  obtenerTipoUsuarioId(descripcion: any) {
    const tipoUsuario = this.tipoUsuarios.find(item => item.Descripcion === descripcion);
    if (tipoUsuario) {
        return tipoUsuario.Id;
    }
    return null;
  };

  obtenerTipoContratoId(descripcion: any) {
    const tipoContrato = this.tipoContratos.find(item => item.Descripcion === descripcion);
    if (tipoContrato) {
        return tipoContrato.Id;
    }
    return null;
  };

  subirMultiples(usuarios: any) {
    this.authService.registrarMultiplesUsuarios(usuarios)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Usuario', 'Todos los usuario fueron registrados correctamente', TipoMessage.success);
        this.router.navigate(['usuario']);
      },
      error:(err) => {
        console.log(err);
      }
    });
  }
}
