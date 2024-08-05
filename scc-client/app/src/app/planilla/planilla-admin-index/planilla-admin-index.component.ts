import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { PlanillaDialogComponent } from '../planilla-dialog/planilla-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface usuarioInterface {
  id: any;
  tipoUsuario: any;
  tipoContrato: any;
  identificacion: string;
  correo: string;
  nombre: string;
  apellidos: string;
  salario: string;
  fechaIngreso: string;
  vacacion: string;
}

@Component({
  selector: 'app-planilla-admin-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatPaginatorModule, MatTableModule, MatSortModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './planilla-admin-index.component.html',
  styleUrl: './planilla-admin-index.component.scss',
  providers: [DatePipe]
})
export class PlanillaAdminIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  
  displayedColumns: string[] = ['identificacion', 'nombre', 'correo', 'puesto', 'tipoContrato', 'acciones'];
  dataUsuario = new Array();
  dataSource: MatTableDataSource<usuarioInterface>;

  fechas:any;
  usuarios: any;
  
  selectedfecha: any;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selectedFecha = new FormGroup({
    fechaInicio: new FormControl<Date | null>(null),
    fechaFinal: new FormControl<Date | null>(null),
  });

  maxDate: Date;
  minDate: Date;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    private paginators: MatPaginatorIntl,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _adapter: DateAdapter<any>
  ){
    paginators.itemsPerPageLabel = 'Items por página'; 

    this._locale = 'cr';
    this._adapter.setLocale(this._locale);

    const currentDate = new Date();
    this.minDate = new Date(2024, 6, 15);
    this.maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, currentDate.getDate());

      this.dataSource = new MatTableDataSource(this.dataUsuario)
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
      }
    });

    this.getUsuarios();
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  crearPlanillas() {
    this.gService.get(`planilla/crear`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Planilla', 'planillas creadas correctamente', TipoMessage.success);
        this.getFechas();
      }
    });
  }

  completarPlanillas() {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.get(`planilla/completar`)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.notificacion.mensaje('Planilla', 'planillas completadas y creadas correctamente', TipoMessage.success);
              this.getFechas();
            }
          });
        }
      });
  }

  getUsuarios() {
    this.gService.get(`usuario`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
        this.getFechas();
      }
    });
  }

  getFechas() {
    this.gService.get(`planilla/fechas`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.data) {
          this.selectedFecha.setValue({
            fechaInicio: new Date(res.data.fechaInicio),
            fechaFinal: new Date(res.data.fechaFinal)
          });
        }
      }
    });
  }

  actualizarFechas() {
    if (this.selectedFecha.value.fechaInicio && this.selectedFecha.value.fechaFinal){
      const fechas = {
        fechaInicio: this.formatearFecha(this.selectedFecha.value.fechaInicio),
        fechaFinal: this.formatearFecha(this.selectedFecha.value.fechaFinal)
      }

      this.gService.post(`planilla/fechas`, fechas)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          this.notificacion.mensaje('Planilla', 'Rango de fechas actualizado correctamente', TipoMessage.success);
        }
      });
    }
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  mostrarPlanilla(idUsuario: any) {
    this.gService.get(`planilla/usuario/${idUsuario}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.openPlanillaDialog(res, idUsuario);
      }
    });
  }

  openPlanillaDialog(res: any, isAsalariado?: any): void {
    let width = isAsalariado != 2 ? '1200px' : '600px';
    let data = { 
      idUsuarioActual: this.usuarioActual.id,
      planilla: res.data,
      isAsalariado: isAsalariado
    };
    
    const dialogRef = this.dialog.open(PlanillaDialogComponent, {
      data,
      width
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  descargarPlanillas() {
    this.gService.exportarPlanillas(this.selectedfecha.split("T")[0]).subscribe(blob => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const hours = ('0' + currentDate.getHours()).slice(-2);
      const minutes = ('0' + currentDate.getMinutes()).slice(-2);
      const seconds = ('0' + currentDate.getSeconds()).slice(-2);
      const dateString = `${year}${month}${day}${hours}${minutes}${seconds}`;
      const fileName = `Usuarios_${dateString}.xlsx`;

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }
}
