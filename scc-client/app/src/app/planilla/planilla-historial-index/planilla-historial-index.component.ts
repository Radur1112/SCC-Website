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
import { PlanillaAnotacionFormDialogComponent } from '../planilla-anotacion-form-dialog/planilla-anotacion-form-dialog.component';
import moment from 'moment';

@Component({
  selector: 'app-planilla-historial-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIcon, MatSelectModule],
  templateUrl: './planilla-historial-index.component.html',
  styleUrl: './planilla-historial-index.component.scss'
})
export class PlanillaHistorialIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = ['numero', 'fecha', 'acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  usuarioActual: any;
  
  loading: boolean = true;
  
  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router:Router,
    private route:ActivatedRoute,
    private dialog: MatDialog
  ){
    
      
    this.getFechaActual();
  }

  getFechaActual() {
    this.gService.get(`planilla/fechaActual`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.data) {
          this.getHistorial(res.data.fechaInicio, res.data.fechaFinal);
        }
      }
    });
  }

  getHistorial(fechaInicio: any, fechaFinal: any) {
    this.loading = true;

    this.gService.get(`planilla/historial`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        let prePlanilla = [{id: 0, fechaInicio: fechaInicio, fechaFinal: fechaFinal, ubicacion: null}, ...res.data];
        console.log(prePlanilla)
        this.dataSource = new MatTableDataSource(prePlanilla);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        this.loading = false;
      }
    });
  }

  descargarResumen(planilla: any) {
    if (planilla.ubicacion) {
      window.open(planilla.ubicacion, '_blank');
    } else {
      this.gService.exportarExcel(`planilla/actual/exportar`).subscribe(blob => {

        const nombre = `resumen_planilla__${moment(new Date(planilla.fechaInicio)).format('YYYYMMDD')}_${moment(new Date(planilla.fechaFinal)).format('YYYYMMDD')}.xlsx`;

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = nombre;
        link.click();
      });
    }
  }

  formatearNombre(nombre: string) {
    const especiales = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'ü': 'u', 'ñ': 'n'
    };
  
    let corregido = nombre.toLowerCase().replace(/\s+/g, '');
    corregido = corregido.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, letra => especiales[letra] || letra);
  
    return corregido;
  }

  irAnotaciones(planilla: any) {
    this.router.navigate(['planilla/anotaciones/', planilla.fechaInicio, planilla.fechaFinal]);
  }
}