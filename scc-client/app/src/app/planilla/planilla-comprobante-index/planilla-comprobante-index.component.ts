import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatPaginator, MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../services/confirmation.service';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { PlanillaComprobanteDialogComponent } from '../planilla-comprobante-dialog/planilla-comprobante-dialog.component';

export interface comproabanteInterface {
  id: any;
  idForo: any;
  ubicacion: any;
}

@Component({
  selector: 'app-planilla-comprobante-index',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule, 
    MatIconModule, 
    MatCardModule, 
    MatTooltipModule, 
    MatAccordion, 
    MatExpansionModule, 
    MatTabsModule,
    MatSelectModule,
    MatGridListModule, 
    MatCheckboxModule],
  templateUrl: './planilla-comprobante-index.component.html',
  styleUrl: './planilla-comprobante-index.component.scss'
})
export class PlanillaComprobanteIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = ['numero', 'fecha', 'totalDeposito', 'acciones'];
  dataComprobante = [];
  dataSource: MatTableDataSource<comproabanteInterface>;

  usuarioId: any;
  usuarioNombre: any;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
  ){
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.usuarioId = params.get('id');

      this.getComprobantes();
    });
  }

  getComprobantes() {
    this.loading = true;

    this.gService.get(`planillaUsuario/usuario/${this.usuarioId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.data.length > 0) {
          this.usuarioNombre = res.data[0].usuarioNombre;
          this.dataSource = new MatTableDataSource(res.data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
        
        this.loading = false;
      }
    });
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

  mostrarComprobante(idPlanilla: any) {
    this.gService.get(`planillaUsuario/comprobante/preview/${idPlanilla}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        const comprobante = res.data;
        this.openComprobanteDialog(comprobante);
      }
    });
  }

  openComprobanteDialog(comprobante: any): void {
    let width = comprobante.usuarioIdTipoContrato != 2 ? '1200px' : '600px';
    let data = { 
      comprobante: comprobante,
      isAsalariado: comprobante.usuarioIdTipoContrato
    };
    
    const dialogRef = this.dialog.open(PlanillaComprobanteDialogComponent, {
      data,
      width
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
      }
    });
  }
}
