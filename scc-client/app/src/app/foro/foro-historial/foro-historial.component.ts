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
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-foro-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './foro-historial.component.html',
  styleUrl: './foro-historial.component.scss'
})
export class ForoHistorialComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = ['usuario', 'accion', 'foroTitulo', 'fecha'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  usuarioActual: any;

  titulo: any;
  foroId: any;
  
  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router:Router,
    private route:ActivatedRoute,
    private dialog: MatDialog
  ){
    
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
      }
    });

    this.route.paramMap.subscribe(params => {
      this.foroId = params.get('id');
      
      if (this.foroId === null) {
        this.titulo = 'Registrar';
      } else {
        this.titulo = 'Actualizar';
      }
      this.getHistorial();
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getHistorial() {
    let query = '';
    if (this.foroId) {
      query = `forohistorial/foro/${this.foroId}`
    } else {
      query = `forohistorial`
    }
    this.gService.get(query)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
}
