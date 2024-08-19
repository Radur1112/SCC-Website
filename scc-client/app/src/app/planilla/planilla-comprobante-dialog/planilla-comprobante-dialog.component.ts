import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';

@Component({
  selector: 'app-planilla-comprobante-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButton, MatIconModule, MatTooltipModule],
  templateUrl: './planilla-comprobante-dialog.component.html',
  styleUrl: './planilla-comprobante-dialog.component.scss'
})
export class PlanillaComprobanteDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  comprobante: any;
  aumentos: any;
  deducciones: any;
  otrosPagos: any;
  showOtrosPagos: any;
  isAsalariado: any;


  constructor(
    private gService: GenericService,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaComprobanteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isAsalariado = data.isAsalariado;
    this.comprobante = data.comprobante;
    if (this.comprobante.aumentos) {
      this.aumentos = this.comprobante.aumentos;
    }
    if (this.comprobante.deducciones) {
      this.deducciones = this.comprobante.deducciones;
    }
    if (this.comprobante.otrosPagos) {
      this.otrosPagos = this.comprobante.otrosPagos;
    }
    console.log(this.comprobante)
  }

  formatearNumero(valor: string) {
    let formateado = parseFloat(valor.replace(/[^\d.-]/g, ''));
    
    if (isNaN(formateado)) {
      return '0.00';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart}.${decimalPart}`;
  }

  descargarComprobante() {
    if (this.comprobante.comprobanteUbicacion) {
      window.open(this.comprobante.comprobanteUbicacion, '_blank');
    } else {
      this.gService.exportarExcel(`planilla/comprobante/exportar/${this.comprobante.id}`).subscribe(blob => {

        const nombre = `comprobante_${this.formatearNombre(this.comprobante.usuarioNombre)}_${moment(new Date(this.comprobante.fechaInicio)).format('YYYYMMDD')}_${moment(new Date(this.comprobante.fechaFinal)).format('YYYYMMDD')}.xlsx`;

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = nombre;
        link.click();
      });
    }
  }

  formatearNombre(nombre: string) {
    const especiales = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'ü': 'u', 'ñ': 'n'
    };
  
    let corregido = nombre.toLowerCase().replace(/\s+/g, '');
    corregido = corregido.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, letra => especiales[letra] || letra);
  
    return corregido;
  }
}
