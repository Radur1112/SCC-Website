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
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlanillaAnotacionFormDialogComponent } from '../planilla-anotacion-form-dialog/planilla-anotacion-form-dialog.component';

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
  
  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private paginators: MatPaginatorIntl,
    private router:Router,
    private route:ActivatedRoute,
    private dialog: MatDialog
  ){
    paginators.itemsPerPageLabel = 'Items por página'; 
      
    this.getHistorial();
  }

  getHistorial() {
    this.gService.get(`planilla/historial`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log(res.data)
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
}