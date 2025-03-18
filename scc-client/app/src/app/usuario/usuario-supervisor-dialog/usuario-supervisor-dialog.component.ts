import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  usuarioId: any;
}

@Component({
  selector: 'app-usuario-supervisor-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatTableModule, 
    MatSortModule, 
    MatIcon, 
    MatTooltipModule, 
    MatSelectModule, 
    FormsModule, 
    MatDialogModule,
    MatCheckboxModule],
  templateUrl: './usuario-supervisor-dialog.component.html',
  styleUrl: './usuario-supervisor-dialog.component.scss'
})
export class UsuarioSupervisorDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  
  displayedColumnsNo: string[] = ['select', 'usuarioIdentificacion', 'usuarioNombre', 'usuarioPuesto'];
  dataUsuarioNo = new Array();
  dataSourceNo: MatTableDataSource<usuarioInterface>;
  
  displayedColumnsSi: string[] = ['select', 'usuarioIdentificacion', 'usuarioNombre', 'usuarioPuesto'];
  dataUsuarioSi = new Array();
  dataSourceSi: MatTableDataSource<usuarioInterface>;

  selectionNo = new SelectionModel<usuarioInterface>(true, []);
  selectionSi = new SelectionModel<usuarioInterface>(true, []);

  supervisor: any;
  
  constructor(private gService:GenericService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private router:Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UsuarioSupervisorDialogComponent>,
  ) {
    this.supervisor = data.supervisor;
    
    this.selectionNo.clear();
    this.selectionSi.clear();

    this.dataSourceNo = new MatTableDataSource(this.supervisor.noSupervisados);
    this.dataSourceSi = new MatTableDataSource(this.supervisor.supervisados);
  }

  applyFilterNo(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceNo.filter = filterValue.trim().toLowerCase();
  }

  applyFilterSi(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSi.filter = filterValue.trim().toLowerCase();
  }

  isAllSelectedNo() {
    const numSelected = this.selectionNo.selected.length;
    const numRows = this.dataSourceNo.filteredData.length;
    return numSelected === numRows;
  }
  toggleAllRowsNo() {
    if (this.isAllSelectedNo()) {
      this.selectionNo.clear();
      return;
    }

    this.selectionNo.select(...this.dataSourceNo.filteredData);
  }

  isAllSelectedSi() {
    const numSelected = this.selectionSi.selected.length;
    const numRows = this.dataSourceSi.filteredData.length;
    return numSelected === numRows;
  }
  toggleAllRowsSi() {
    if (this.isAllSelectedSi()) {
      this.selectionSi.clear();
      return;
    }

    this.selectionSi.select(...this.dataSourceSi.filteredData);
  }

  asignarUsuarios() {
    if (this.selectionNo.selected.length === 0) {
      return;
    }

    const datos = {
      idSupervisor: this.supervisor.id,
      datos: this.selectionNo.selected
    }

    this.gService.post(`usuarioSupervisor/multiple`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Usuario', `Usuarios asignados al supervisor '${this.supervisor.nombre}' correctamente`, TipoMessage.success);
        this.dialogRef.close(true);
      }
    });
  }

  desasignarUsuarios() {
    const datos = {
      idSupervisor: this.supervisor.id,
      idUsuarios: this.selectionSi.selected.map(um => um.usuarioId)
    }

    if (datos.idUsuarios.length === 0) {
      return;
    }
    
    this.gService.post(`usuarioSupervisor/borrar/multiple`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Usuario', `Usuarios desasignados del supervisor '${this.supervisor.nombre}' correctamente`, TipoMessage.success);
        this.dialogRef.close(true);
      }
    });
  }
}
