import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmacion-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButton],
  templateUrl: './confirmacion-dialog.component.html',
  styleUrl: './confirmacion-dialog.component.scss'
})
export class ConfirmacionDialogComponent {
  mensaje: any;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.mensaje) {
      this.mensaje = data.mensaje;
    } else {
      this.mensaje = '¿Está seguro que desea realizar esta acción?'
    }
  }
}
