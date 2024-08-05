import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { NotificacionService, TipoMessage } from '../../services/notification.service';

@Component({
  selector: 'app-planilla-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButton],
  templateUrl: './planilla-dialog.component.html',
  styleUrl: './planilla-dialog.component.scss'
})
export class PlanillaDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  idUsuarioActual: any;
  
  isAsalariado: any;

  planilla: any;
  preTexto: any;

  tipoAumentos: any;
  tipoDeducciones: any;
  tipoOtrosPagos: any;

  aumentos: any = [];
  deducciones: any = [];
  otrosPagos: any = [];

  aumentosInicial: any = [];
  deduccionesInicial: any = [];
  otrosPagosInicial: any = [];

  noti: any = 0;

  constructor(
    private gService: GenericService,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idUsuarioActual = data.idUsuarioActual;
    this.planilla = data.planilla;
    this.isAsalariado = data.isAsalariado;
    console.log(this.planilla)
    this.getTipos();
  }

  getTipos() {
    this.gService.get(`planilla/tipos`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        for (let tipo of res.data) {
          switch (tipo.tipo) {
            case "Aumentos":
              this.tipoAumentos = tipo.lista;
              break;
            case "Deducciones":
              this.tipoDeducciones = tipo.lista;
              break;
            case "Otros Pagos":
              this.tipoOtrosPagos = tipo.lista;
              break;
          }
        }

        this.bindTipos();
      }
    });
  }

  bindTipos() {
    this.tipoAumentos.forEach(tipo => {
      if ((tipo.sp === 0 && this.planilla.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planilla.usuarioIdTipoContrato === 2)) {
        if (this.planilla.aumentos) {
          const monto = this.planilla.aumentos.reduce((sum, item) => {
            return item.tipoAumentoId === tipo.id ? sum + item.aumentoMonto : sum;
          }, 0);
          
          this.aumentos.push({idTipoAumento: tipo.id, descripcion: tipo.descripcion, monto: this.formatearNumero(monto.toString()), fijo: tipo.fijo, valor: tipo.valor});
          this.aumentosInicial.push(this.formatearNumero(monto.toString()));
        } else {
          this.aumentos.push({idTipoAumento: tipo.id, descripcion: tipo.descripcion, monto: '0.00', fijo: tipo.fijo, valor: tipo.valor});
          this.aumentosInicial.push('0.00');
        }
      }
    });

    this.tipoDeducciones.forEach(tipo => {
      if ((tipo.sp === 0 && this.planilla.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planilla.usuarioIdTipoContrato === 2)) {
        if (this.planilla.deducciones) {
          const monto = this.planilla.deducciones.reduce((sum, item) => {
            return item.tipoDeduccionId === tipo.id ? sum + item.deduccionMonto : sum;
          }, 0);
          
          this.deducciones.push({idTipoDeduccion: tipo.id, descripcion: tipo.descripcion, monto: this.formatearNumero(monto.toString()), fijo: tipo.fijo, valor: tipo.valor});
          this.deduccionesInicial.push(this.formatearNumero(monto.toString()));
        } else {
          this.deducciones.push({idTipoDeduccion: tipo.id, descripcion: tipo.descripcion, monto: '0.00', fijo: tipo.fijo, valor: tipo.valor});
          this.deduccionesInicial.push('0.00');
        }
      }
    });
    
    this.tipoOtrosPagos.forEach(tipo => {
      if ((tipo.sp === 0 && this.planilla.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planilla.usuarioIdTipoContrato === 2)) {
        if (this.planilla.otrosPagos) {
          const monto = this.planilla.otrosPagos.reduce((sum, item) => {
            return item.tipoOtroPagoId === tipo.id ? sum + item.otroPagoMonto : sum;
          }, 0);
          
          this.otrosPagos.push({idTipoOtroPago: tipo.id, descripcion: tipo.descripcion, monto: this.formatearNumero(monto.toString()), fijo: tipo.fijo, valor: tipo.valor});
          this.otrosPagosInicial.push(this.formatearNumero(monto.toString()));
        } else {
          this.otrosPagos.push({idTipoOtroPago: tipo.id, descripcion: tipo.descripcion, monto: '0.00', fijo: tipo.fijo, valor: tipo.valor});
          this.otrosPagosInicial.push('0.00');
        }
      }
    });
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
      return '0.00';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart}.${decimalPart}`;
  }

  confirmarTexto(event: any, field?: any) {
    const value = event.target.innerText.trim();
    const formattedValue = this.formatearNumero(value.toString());
    
    field.monto = formattedValue;

    this.getSalarios();
  }

  getSalarios() {
    this.aumentos = this.aumentos.map(item => {
      if (item.fijo === 2) {
        const valor = parseFloat(this.planilla.salarioBase) * item.valor / 100;
        item.monto = this.formatearNumero(valor.toString());
      }
      return item;
    });
    const aumento = this.aumentos.reduce((sum, item) => sum + this.stringToFloat(item.monto), 0);

    const baseFacturacion = aumento;


    this.otrosPagos = this.otrosPagos.map(item => {
      if (item.fijo === 2) {
        const valor = baseFacturacion * item.valor / 100;
        item.monto = this.formatearNumero(valor.toString());
      }
      return item;
    });
    const otroPago = this.otrosPagos.reduce((sum, item) => sum + this.stringToFloat(item.monto), 0);
    

    const salarioBruto =  this.planilla.usuarioIdTipoContrato != 2 ? parseFloat(this.planilla.salarioBase) + aumento : baseFacturacion + otroPago;
    

    this.deducciones = this.deducciones.map(item => {
      if (item.fijo === 2) {
        const valor = salarioBruto * item.valor / 100;
        item.monto = this.formatearNumero(valor.toString());
      }
      return item;
    });
    const deduccion = this.deducciones.reduce((sum, item) => sum + this.stringToFloat(item.monto), 0);

    
    const salarioNeto =  salarioBruto - deduccion;


    this.planilla.baseFacturacion = this.formatearNumero(baseFacturacion.toString());
    this.planilla.salarioBruto = this.formatearNumero(salarioBruto.toString());
    this.planilla.totalDeducciones = this.formatearNumero(deduccion.toString());
    this.planilla.salarioNeto = this.formatearNumero(salarioNeto.toString());
  }

  stringToFloat(valor: string) {
    return parseFloat(valor.replace(/[^\d.-]/g, ''))
  }

  guardarPlanilla() {
    let newAumentos = [];
    let newDeducciones = [];
    let newOtrosPagos = [];
    
    this.aumentos.forEach((tipo, index) => {
      if (tipo.fijo != 2) {
        const newMonto = this.stringToFloat(tipo.monto) - this.stringToFloat(this.aumentosInicial[index]);
        if (newMonto != 0) {
          newAumentos.push({
            idPlanilla: this.planilla.id,
            idTipoAumento: tipo.idTipoAumento, 
            descripcion: 'Cambio de administrador', 
            monto: newMonto,
            idUsuario: this.idUsuarioActual
          });
        }
      }
    });

    this.deducciones.forEach((tipo, index) => {
      if (tipo.fijo != 2) {
        const newMonto = this.stringToFloat(tipo.monto) - this.stringToFloat(this.deduccionesInicial[index]);
        if (newMonto != 0) {
          newDeducciones.push({
            idPlanilla: this.planilla.id,
            idTipoDeduccion: tipo.idTipoDeduccion, 
            descripcion: 'Cambio de administrador', 
            monto: newMonto,
            idUsuario: this.idUsuarioActual
          });
        }
      }
    });

    this.otrosPagos.forEach((tipo, index) => {
      if (tipo.fijo != 2) {
        const newMonto = this.stringToFloat(tipo.monto) - this.stringToFloat(this.otrosPagosInicial[index]);
        if (newMonto != 0) {
          newOtrosPagos.push({
            idPlanilla: this.planilla.id,
            idTipoOtroPago: tipo.idTipoOtroPago, 
            descripcion: 'Cambio de administrador', 
            monto: newMonto,
            idUsuario: this.idUsuarioActual
          });
        }
      }
    });

    if (newAumentos.length > 0) {
      this.crearAumentos(newAumentos);
    }
    if (newDeducciones.length > 0) {
      this.crearDeducciones(newDeducciones);

    }
    if (newOtrosPagos.length > 0) {
      this.crearOtrosPagos(newOtrosPagos);
    }

    if (this.noti == 3) {
      this.notificacion.mensaje('Planilla', 'Cambio realizado correctamente', TipoMessage.success);
    }
    
    this.dialogRef.close(true);
  }

  crearAumentos(crear: any) {
    this.gService.post(`aumento/multiple`, crear)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.noti++;
      }
    });
  }

  crearDeducciones(crear: any) {
    this.gService.post(`deduccion/multiple`, crear)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.noti++;
      }
    });
  }

  crearOtrosPagos(crear: any) {
    this.gService.post(`otroPago/multiple`, crear)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.noti++;
      }
    });
  }
}

