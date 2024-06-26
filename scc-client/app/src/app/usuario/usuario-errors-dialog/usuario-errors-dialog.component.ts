import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-usuario-errors-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './usuario-errors-dialog.component.html',
  styleUrl: './usuario-errors-dialog.component.scss'
})
export class UsuarioErrorsDialogComponent {
  rowIndex: any;
  errors: any;
  errorKeys: any;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rowIndex = data.rowIndex
    this.errors = data.errors;
    if (this.errors) {
      this.errorKeys = Object.keys(this.errors);
    }
  }
}
