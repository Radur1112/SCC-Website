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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { PlanillaAnotacionFormDialogComponent } from '../planilla-anotacion-form-dialog/planilla-anotacion-form-dialog.component';
import { AlertaService, TipoMessage } from '../../services/alerta.service';

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
  
  displayedColumns: string[] = ['usuarioIdentificacion', 'usuarioNombre', 'usuarioCorreo', 'puestoDescripcion', 'tipoContratoDescripcion', 'acciones'];
  dataUsuario = new Array();
  dataSource: MatTableDataSource<usuarioInterface>;

  usuarioActual: any;
  planillaActual: any;

  fechas:any;
  usuarios: any;
  
  selectedfecha: any;
  
  @ViewChild(MatSort) sort: MatSort;
  
  loading: boolean = true;

  constructor(private gService:GenericService,
    private alerta: AlertaService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
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
        this.getActual();
      }
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getActual() {
    this.loading = true;

    this.gService.get(`planilla/actual`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.data) {
          this.planillaActual = res.data;
          this.getPlanillaUsuarios();
        } else {
          this.loading = false;
        }
      }
    });
  }

  getPlanillaUsuarios() {
    this.loading = true;

    let query = `planillaUsuario/planilla/${this.planillaActual.id}`;
    if (this.usuarioActual.idTipoUsuario == 3) {
      query += `/supervisor/${this.usuarioActual.id}`
    }
    this.gService.get(query)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.sort = this.sort;
        
        this.loading = false;
      }
    });
  }

  mostrarAnotaciones(idPlanillaUsuario: any) {
    this.gService.get(`planillaUsuario/${idPlanillaUsuario}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.openAnotacionDialog(res.data);
      }
    });
  }

  openAnotacionDialog(planillaUsuario: any) {
    let width = '600px';
    let data = { 
      isCrear: true,
      planillaUsuario: planillaUsuario,
      idUsuarioActual: this.usuarioActual.id
    };
    
    const dialogRef = this.dialog.open(PlanillaAnotacionFormDialogComponent, {
      data,
      width,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.crearAnotaciones(result);
      }
    });
  }

  crearAnotaciones(anotaciones: any[]) {
    this.gService.post(`planillaUsuarioAnotacion/multiple`, anotaciones)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Anotacion', 'Anotaciones guardadas correctamente', TipoMessage.success);
      }
    });
  }
}