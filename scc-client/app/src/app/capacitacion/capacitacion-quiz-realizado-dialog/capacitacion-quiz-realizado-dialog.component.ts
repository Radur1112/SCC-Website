import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-capacitacion-quiz-realizado-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButton, MatIconModule],
  templateUrl: './capacitacion-quiz-realizado-dialog.component.html',
  styleUrl: './capacitacion-quiz-realizado-dialog.component.scss'
})
export class CapacitacionQuizRealizadoDialogComponent {
  mensaje: any;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.mensaje) {
      this.mensaje = data.mensaje;
    } else {
      this.mensaje = 'Este quiz ya ha sido realizado'
    }
  }
}
