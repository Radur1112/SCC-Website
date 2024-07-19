import { CommonModule } from '@angular/common';
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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { PlanillaDialogComponent } from '../planilla-dialog/planilla-dialog.component';
import { MatSelectModule } from '@angular/material/select';

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
  imports: [CommonModule, RouterLink, MatTableModule, MatSortModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './planilla-admin-index.component.html',
  styleUrl: './planilla-admin-index.component.scss'
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
  
  @ViewChild(MatSort) sort: MatSort;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
  ){
      this.dataSource = new MatTableDataSource(this.dataUsuario)
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
      }
    });

    this.getFechas();
    this.getUsuarios();
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getFechas() {
    this.gService.get(`planilla/fecha`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.fechas = res.data;
        this.selectedfecha = this.fechas[0].fecha
      }
    });
  }

  getUsuarios() {
    this.gService.get(`usuario`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.sort = this.sort;
      }
    });
  }

  mostrarPlanilla(idUsuario: any) {
    this.gService.getParam(`planilla/usuario/${idUsuario}`, this.selectedfecha.split("T")[0])
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.openPlanillaDialog(res, idUsuario);
      }
    });
  }

  openPlanillaDialog(res: any, isAsalariado?: any): void {
    let width = isAsalariado != 2 ? '1200px' : '600px';
    let data = { 
      planilla: res.data,
      isAsalariado: isAsalariado
    };
    
    const dialogRef = this.dialog.open(PlanillaDialogComponent, {
      data,
      width
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
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
