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
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-usuario-vacacion-supervisor',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatSortModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './usuario-vacacion-supervisor.component.html',
  styleUrl: './usuario-vacacion-supervisor.component.scss',
  animations: [
    trigger('expand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class UsuarioVacacionSupervisorComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  
  displayedColumns: string[] = ['usuarioIdentificacion', 'usuarioNombre', 'fechaInicio', 'comentario', 'acciones'];
  expandedElement: any | null;
  dataUsuario = new Array();
  dataSource: MatTableDataSource<any>;

  fechas:any;
  usuarios: any;
  
  @ViewChild(MatSort) sort: MatSort;
  
  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
  ){
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;

        this.getVacaciones();
      }
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getVacaciones() {
    this.loading = true;
    let query = `vacacion/pendientes`;
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

  confirmar(id: any) {
    this.loading = true;
    const datos = {
      id: id,
      idSupervisor: this.usuarioActual.id
    }

    this.gService.put(`vacacion/confirmar`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Vacación', 'Vacaciones confirmadas correctamente', TipoMessage.success);
        this.getVacaciones();
      }
    });
  }

  rechazar(id: any) {
    this.loading = true;
    const datos = {
      id: id,
      idSupervisor: this.usuarioActual.id
    }

    this.gService.put(`vacacion/rechazar`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Vacación', 'Vacaciones rechazadas correctamente', TipoMessage.success);
        this.getVacaciones();
      }
    });
  }
}