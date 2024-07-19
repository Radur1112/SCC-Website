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
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';

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

  displayedColumns: string[] = ['numero', 'fecha', 'salarioNeto', 'acciones'];
  dataComprobante = [
    {
      id: '1',
      idForo: '1',
      ubicacion: '1',
      fecha: '15/07/2024',
      salarioNeto: '340000'
    },
    {
      id: '1',
      idForo: '1',
      ubicacion: '1',
      fecha: '01/08/2024',
      salarioNeto: '570000'
    },
    {
      id: '1',
      idForo: '1',
      ubicacion: '1',
      fecha: '15/08/2024',
      salarioNeto: '785555'
    }
  ];
  dataSource: MatTableDataSource<comproabanteInterface>;
  
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
      this.dataSource = new MatTableDataSource(this.dataComprobante)
  }
  

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  descargarComprobante(id: any) {

  }
}
