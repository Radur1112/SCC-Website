import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { UsuarioErrorsDialogComponent } from '../usuario-errors-dialog/usuario-errors-dialog.component';
import { MatIconModule } from '@angular/material/icon';

export interface usuarioInterface {
  id: any;
  tipoUsuario: any;
  tipoContrato: any;
  identificacion: string;
  correo: string;
  nombre: string;
  apellidos: string;
  salario: string;
  fechaIngreso: string;
  vacacion: string;
}

@Component({
  selector: 'app-usuario-registrar-dialog',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './usuario-registrar-dialog.component.html',
  styleUrl: './usuario-registrar-dialog.component.scss'
})
export class UsuarioRegistrarDialogComponent {
  errors: any;
  usuarios: any;
  
  displayedColumns: string[] = ['nombre', 'identificacion', 'puesto', 'correo', 'password', 'salario', 'tipoContrato', 'vacacion', 'tipoUsuario', 'telefono', 'fechaIngreso'];
  dataUsuario = new Array();
  dataSource: MatTableDataSource<usuarioInterface>;
  
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.errors = data.data.errors;
    this.usuarios = data.data.usuarios;
    
    this.dataSource = new MatTableDataSource(this.usuarios);
  }

  tieneError(rowIndex: any, columna: any) {
    if (this.errors) {
      const keys = Object.keys(this.errors);
    
      if (keys.includes(rowIndex.toString())) {
        if (columna) {
          if (Object.keys(this.errors[rowIndex]).includes(columna.toString())) {
             return true;
          } else {
            return false
          }
        }
        return true;
      }
    }
    return false;
  }

  mostrarErrores(rowIndex: any) {
    let width = '600px';
    let data = { 
      rowIndex: rowIndex,
      errors: this.errors ? this.errors[rowIndex] : this.errors,
    };
    
    const dialogRef = this.dialog.open(UsuarioErrorsDialogComponent, {
      data,
      width
    });
  }
}
