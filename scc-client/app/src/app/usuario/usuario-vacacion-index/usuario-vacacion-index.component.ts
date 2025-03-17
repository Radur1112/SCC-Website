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
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';
import moment from 'moment';
import { AlertaService, TipoMessage } from '../../services/alerta.service';

@Component({
  selector: 'app-usuario-vacacion-index',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './usuario-vacacion-index.component.html',
  styleUrl: './usuario-vacacion-index.component.scss'
})
export class UsuarioVacacionIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  usuarioId: any;
  
  displayedColumns: string[] = ['usuarioIdentificacion', 'usuarioNombre', 'fechaInicio', 'comentario', 'estadoTexto', 'supervisorNombre'];
  expandedElement: any | null;
  dataUsuario = new Array();
  dataSource: MatTableDataSource<any>;

  fechas:any;
  usuarios: any;

  isSupervisor: boolean = false;

  estados = {
    0: 'Rechazado',
    1: 'Confirmado',
    2: 'Pendiente',
    3: 'Cancelado'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute
  ){
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.usuarioId = params.get('id');
      
      this.authService.usuarioActual.subscribe((x) => {
        if (x && Object.keys(x).length !== 0) {
          this.usuarioActual = x.usuario;
          this.isSupervisor = this.usuarioActual.idTipoUsuario == 3 || this.usuarioActual.idTipoUsuario == 1;
          
          if (this.isSupervisor && !this.usuarioId) {
            this.displayedColumns.push('accion');
          }

          this.getVacaciones();
        }
      });
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getVacaciones() {
    this.loading = true;
    let query = `vacacion`;
    if (this.usuarioId !== null) {
      query += `/usuario/${this.usuarioId}`
    } else if (this.usuarioActual.idTipoUsuario == 3) {
      query += `/supervisor/${this.usuarioActual.id}`
    }
    
    this.gService.get(query)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        let vacaciones = res.data.map(vacacion => ({
          ...vacacion,
          estadoTexto: this.estados[vacacion.estado]
        }));
        this.dataSource = new MatTableDataSource(vacaciones);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        this.loading = false;
      }
    });
  }

  descargarExcel() {
    let query = `vacacion/exportar`;
    if (this.usuarioActual.idTipoUsuario == 3) {
      query += `/supervisor/${this.usuarioActual.id}`
    }
    this.gService.exportarExcel(query).subscribe(blob => {

      const nombre = `vacaciones_${moment().format('YYYYMMDD')}.xlsx`;

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = nombre;
      link.click();
    });
  }

  cancelarVacacion(id: any, estado: any) {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        const datos = {
          id: id,
          idSupervisor: this.usuarioActual.id
        }
    
        this.gService.put2(`vacacion/cancelar/${id}/${estado}`, datos)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.alerta.mensaje('Vacación', 'Vacaciones canceladas correctamente', TipoMessage.success);
            this.getVacaciones();
          }
        });
      }
    });
  }
}
