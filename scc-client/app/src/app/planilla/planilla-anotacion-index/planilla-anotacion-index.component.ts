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
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlanillaAnotacionFormDialogComponent } from '../planilla-anotacion-form-dialog/planilla-anotacion-form-dialog.component';

@Component({
  selector: 'app-planilla-anotacion-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './planilla-anotacion-index.component.html',
  styleUrl: './planilla-anotacion-index.component.scss'
})
export class PlanillaAnotacionIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = ['tipo', 'usuarioNombre', 'descripcion', 'monto', 'fecha', 'creadoPor'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  usuarioActual: any;
  planillaId: any;

  loading: boolean = true;
  
  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private router:Router,
    private route:ActivatedRoute,
    private dialog: MatDialog
  ){
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.planillaId = params.get('id');

      this.authService.usuarioActual.subscribe((x) => {
        if (x && Object.keys(x).length !== 0) {
          this.usuarioActual = x.usuario;

          if (!this.planillaId) {
            this.displayedColumns.push('acciones')
          }

          this.getHistorial();
        }
      });
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getHistorial() {
    this.loading = true;

    let query = ``;
    if (this.planillaId) {
      query = `planillaUsuarioAnotacion/historial/planilla/${this.planillaId}`;
      if (this.usuarioActual.idTipoUsuario == 3) {
        query += `/supervisor/${this.usuarioActual.id}`
      }
    } else {
      query = `planillaUsuarioAnotacion/activa`;
      if (this.usuarioActual.idTipoUsuario == 3) {
        query += `/supervisor/${this.usuarioActual.id}`
      }
    }
    
    this.gService.get(query)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
      this.loading = false;
      }
    });
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  formatearNumero(valor: string) {
    valor = valor ?? '';
    let perFormateado = (valor+'').replace(/,/g, '.');
    let formateado = parseFloat(perFormateado.replace(/[^\d.-]/g, ''));
    
    if (isNaN(formateado)) {
      return '0.00';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart},${decimalPart}`;
  }

  openAnotacionDialog(planillaUsuarioAnotacion: any) {
    let width = '600px';
    let data = { 
      isCrear: false,
      planillaUsuario: planillaUsuarioAnotacion,
      descripcion: planillaUsuarioAnotacion.descripcion,
      monto: planillaUsuarioAnotacion.monto,
      anotacionId: planillaUsuarioAnotacion.anotacionId,
      idUsuarioActual: this.usuarioActual.id
    };
    
    const dialogRef = this.dialog.open(PlanillaAnotacionFormDialogComponent, {
      data,
      width
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarAnotacion(result);
      }
    });
  }

  actualizarAnotacion(anotacion: any) {
    this.gService.put(`planillaUsuarioAnotacion`, anotacion)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Anotacion', 'Anotacion actualizada correctamente', TipoMessage.success);
        this.getHistorial();
      },
      error:(err) => {
        console.log(err);
      }
    });
  }

  borrarAnotacion(anotacion: any) {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.put(`planillaUsuarioAnotacion/borrar`, anotacion)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.alerta.mensaje('Anotacion', 'Anotacion eliminada correctamente', TipoMessage.success);
              this.getHistorial();
            },
            error:(err) => {
              console.log(err);
            }
          });
        }
      });
  }
}

function transformarTipo(input) {
  let lowerCaseStr = input.toLowerCase();

  let words = lowerCaseStr.split(' ');

  for (let i = 1; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1);
  }

  return words.join('');
}
