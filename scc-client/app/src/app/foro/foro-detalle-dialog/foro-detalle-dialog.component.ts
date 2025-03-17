import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-foro-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatIconModule, MatDialogModule],
  templateUrl: './foro-detalle-dialog.component.html',
  styleUrl: './foro-detalle-dialog.component.scss'
})
export class ForoDetalleDialogComponent {
  displayedColumns: string[] = ['usuarioNombre', 'fechaCreado', 'respuesta'];
  dataSource: MatTableDataSource<any>;
  
  @ViewChild(MatSort) sort: MatSort;

  respuestas: any[] = [];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ForoDetalleDialogComponent>
  ) {
    this.respuestas = this.data.respuestas;

    this.dataSource = new MatTableDataSource(this.respuestas);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
