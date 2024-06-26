import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmacionDialogComponent } from '../confirmacion-dialog/confirmacion-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private dialog: MatDialog) {}

  confirm(mensaje?: string): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmacionDialogComponent> = this.dialog.open(ConfirmacionDialogComponent, {
      width: '600px',
      data: { mensaje }
    });

    return dialogRef.afterClosed();
  }
}