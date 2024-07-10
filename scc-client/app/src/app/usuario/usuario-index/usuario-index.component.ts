import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {MatPaginator, MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificacionService, TipoMessage } from '../../services/notification.service';

export interface usuarioInterface {
  id: any;
  idTipoUsuario: any;
  idTipoContrato: any;
  identificacion: string;
  correo: string;
  nombre: string;
  apellidos: string;
  salario: string;
  fechaIngreso: string;
  vacacion: string;
  estado: string;
}

@Component({
  selector: 'app-usuario-index',
  standalone: true,
  imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIcon, MatCardModule, MatTooltipModule],
  templateUrl: './usuario-index.component.html',
  styleUrl: './usuario-index.component.scss'
})
export class UsuarioIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  usuarioForm: FormGroup;
  
  displayedColumns: string[] = ['identificacion', 'tipoUsuarioDescripcion', 'nombre', 'correo', 'tipoContratoDescripcion', 'estado'];
  dataUsuario = new Array();
  dataSource: MatTableDataSource<usuarioInterface>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private paginators: MatPaginatorIntl,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    private httpClient:HttpClient,
    private fb: FormBuilder
  ){
      paginators.itemsPerPageLabel = 'Items por página'; 
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

  getUsuarios() {
    this.gService.get(`usuario`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  actualizarUsuario(id: any) {
    this.router.navigate(['/usuario/actualizar', id], {
      relativeTo: this.route,
    });
  }

  borrarUsuario(usuario: any) {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.put(`usuario/borrar`, usuario)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.notificacion.mensaje('Usuario', 'Usuario eliminado correctamente', TipoMessage.success);
              this.getUsuarios();
            },
            error:(err) => {
              console.log(err);
            }
          });
        }
      });
  }

  descargarUsuarios() {
    this.gService.exportarUsuarios().subscribe(blob => {
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