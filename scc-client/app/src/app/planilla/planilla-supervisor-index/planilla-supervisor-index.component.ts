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
import { MatSelectModule } from '@angular/material/select';
import { PlanillaSupervisorAnotacionDialogComponent } from '../planilla-supervisor-anotacion-dialog/planilla-supervisor-anotacion-dialog.component';

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
  selector: 'app-planilla-supervisor-index',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatSortModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './planilla-supervisor-index.component.html',
  styleUrl: './planilla-supervisor-index.component.scss'
})
export class PlanillaSupervisorIndexComponent {
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
;
    this.getUsuarios();
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  mostrarAnotaciones(idUsuario: any) {
    this.gService.get(`planilla/usuario/${idUsuario}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.openPlanillaDialog(res);
      }
    });
  }

  openPlanillaDialog(res: any): void {
    let width = '1200px';
    let data = { 
      planilla: res.data,
      
    };
    
    const dialogRef = this.dialog.open(PlanillaSupervisorAnotacionDialogComponent, {
      data,
      width
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
      }
    });
  }
}