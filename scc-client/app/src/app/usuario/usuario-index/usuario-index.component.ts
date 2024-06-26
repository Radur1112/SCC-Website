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
  cantVacacion: string;
  estado: string;
}

@Component({
  selector: 'app-usuario-index',
  standalone: true,
  imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIcon, MatCardModule],
  templateUrl: './usuario-index.component.html',
  styleUrl: './usuario-index.component.scss'
})
export class UsuarioIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  usuarioForm: FormGroup;
  
  displayedColumns: string[] = ['Identificacion', 'TipoUsuarioDescripcion', 'Nombre', 'Correo', 'TipoContratoDescripcion', 'Estado'];
  dataUsuario = new Array();
  dataSource: MatTableDataSource<usuarioInterface>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  showTooltip = false;

  constructor(private gService:GenericService,
    private authService: AuthService,
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
    this.gService.get('usuario/all')
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log(res)
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

  cambiarEstado(usuario: any) {
    usuario.Estado = usuario.Estado == 1 ? 0 : 1;

    this.gService.put('usuario', usuario)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.getUsuarios();
      },
      error:(err) => {
        console.log(err);
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