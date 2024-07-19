import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-planilla-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButton],
  templateUrl: './planilla-dialog.component.html',
  styleUrl: './planilla-dialog.component.scss'
})
export class PlanillaDialogComponent {
  usuario: any = {
    nombre: 'Christian Calvo Martinez',
    salarioBase: 390000,
    comision: 0,
    horasExtra: 0,
    incentivos: 0,
    bonificaciones: 0,
    salarioBruto: 390000,
    salarioNeto: 348387,
    ccss: 41613,
    impuestoRenta: 0,
    adelantoSalario: 0,
    prestamos: 0,
    otrosRebajos: 0,
    totalDeducciones: 41613,
    viaticos: 0,
    vacaciones: 4.30,
    fecha: new Date('2024-07-15'),

    bonoProductividad: '120000.00',
    baseFacturacion: '120000.00',
    impuestoAgregado: '15600.00',
    subtotal: '135600.00',
    totalDesembolso: '135600.00'
  };
  
  isAsalariado: any;

  planilla: any;
  preTexto: any;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.planilla = data.planilla;
    this.isAsalariado = data.isAsalariado;
  }

  focusTexto(evento: any) {
    this.preTexto = evento.target.innerText.trim();
  }

  textoEditado(event: any) {
    const valor = event.target.innerText.trim();
    const formateado = this.formatearNumero(valor);

    this.preTexto = formateado;
  }

  formatearNumero(valor: string) {
    let formateado = parseFloat(valor.replace(/[^\d.-]/g, ''));
    
    if (isNaN(formateado)) {
      return '';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart}.${decimalPart}`;
  }

  confirmarTexto(event: any, field?: any) {
    const value = event.target.innerText.trim();
    const formattedValue = this.formatearNumero(value);
    
    this.usuario[field] = formattedValue;

    this.getSalarios();
  }

  getSalarios() {
    const salarioBruto =  parseFloat(this.planilla.salarioBase) + parseFloat(this.usuario.comision.replace(/[^\d.-]/g, ''));

    this.planilla.salarioBruto = this.formatearNumero(salarioBruto.toString());
  }
}

