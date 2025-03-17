import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PlanillaAnotacionFormDialogComponent } from '../planilla-anotacion-form-dialog/planilla-anotacion-form-dialog.component';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-planilla-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './planilla-dialog.component.html',
  styleUrl: './planilla-dialog.component.scss'
})
export class PlanillaDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  idUsuarioActual: any;
  usuarioId: any;
  
  isAsalariado: any;

  planillaUsuario: any;
  preTexto: any;

  aumentos: any[] = [];
  deducciones: any[] = [];
  otrosPagos: any[] = [];

  newAnotaciones: any[] = [];

  salarioInicial: any;
  modificarSalario: any;

  noti: any = 0;

  constructor(
    private gService: GenericService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idUsuarioActual = data.idUsuarioActual;
    this.usuarioId = data.usuarioId;
    this.planillaUsuario = data.planillaUsuario;
    this.isAsalariado = data.isAsalariado;

    this.salarioInicial = this.planillaUsuario.salarioBase;

    this.bindAnotaciones();
  }

  bindAnotaciones() {
    this.aumentos = this.planillaUsuario.aumentos;
    this.deducciones = this.planillaUsuario.deducciones;
    this.otrosPagos = this.planillaUsuario.otrosPagos;
    /*
    this.tipoAumentos.forEach(tipo => {
      if ((tipo.sp === 0 && this.planillaUsuario.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planillaUsuario.usuarioIdTipoContrato === 2)) {
        if (this.planillaUsuario.aumentos) {
          const monto = this.planillaUsuario.aumentos.reduce((sum, item) => {
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
      if ((tipo.sp === 0 && this.planillaUsuario.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planillaUsuario.usuarioIdTipoContrato === 2)) {
        if (this.planillaUsuario.deducciones) {
          const monto = this.planillaUsuario.deducciones.reduce((sum, item) => {
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
      if ((tipo.sp === 0 && this.planillaUsuario.usuarioIdTipoContrato === 1) || (tipo.sp === 1 && this.planillaUsuario.usuarioIdTipoContrato === 2)) {
        if (this.planillaUsuario.otrosPagos) {
          const monto = this.planillaUsuario.otrosPagos.reduce((sum, item) => {
            return item.tipoOtroPagoId === tipo.id ? sum + item.otroPagoMonto : sum;
          }, 0);
          
          this.otrosPagos.push({idTipoOtroPago: tipo.id, descripcion: tipo.descripcion, monto: this.formatearNumero(monto.toString()), fijo: tipo.fijo, valor: tipo.valor});
          this.otrosPagosInicial.push(this.formatearNumero(monto.toString()));
        } else {
          this.otrosPagosInicial.push('0.00');
        }
      }
    });

    this.showOtrosPagos = this.otrosPagos
    .filter(op => op.monto !== '-1')
    .map(op => op.descripcion)
    .join(', ');  
    */
  }

  formatearNumero(valor: string) {
    valor = valor ?? '';
    let perFormateado = (valor+'').replace(/,/g, '.');
    let formateado = parseFloat(perFormateado.replace(/[^\d.-]/g, ''));
    
    if (isNaN(formateado)) {
      return '0.00';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart}.${decimalPart}`;
  }

  confirmarTexto(event: any, field?: any, salario?: boolean) {
    const value = event.target.innerText.trim();
    const formattedValue = this.formatearNumero(value.toString());
    event.target.innerText = formattedValue;
    
    if (field) {
      if (this.stringToFloat(field.monto) != this.stringToFloat(formattedValue)) {
        const previousMonto = field.monto;
        field.monto = formattedValue;
        
        let newField = JSON.parse(JSON.stringify(field));
        const anotacion = {
          anotacionDescripcion: newField.descripcion,
          descripcion: 'Cambio de administrador',
          idAnotacion: newField.anotacionId,
          idPlanillaUsuario: this.planillaUsuario.id,
          idUsuario: this.idUsuarioActual,
          monto: this.stringToFloat(field.monto) - this.stringToFloat(previousMonto),
          general: true
        }

        this.newAnotaciones = (this.addOrUpdateAnotacion(this.newAnotaciones, anotacion))
      }
    }

    if (salario) {
      this.modificarSalario = this.stringToFloat(formattedValue);
      this.planillaUsuario.salarioBase = formattedValue;
    }

    this.updateSalarios();
  }

  addOrUpdateAnotacion(anotaciones, data) {
    const anotacion = anotaciones.find(a => a.idAnotacion === data.idAnotacion && a.general == true);
  
    if (anotacion) {
      anotacion.monto += data.monto;

      if (anotacion.monto === 0) {
        anotaciones = anotaciones.filter(a => a.idAnotacion !== anotacion.idAnotacion && a.general == true);
      }
    } else {
      anotaciones.push(data);
    }
  
    return anotaciones;
  }

  updateSalarios() {
    //Actualizacion de aumentos fijos
    this.aumentos = this.calculateFijos(this.aumentos, this.stringToFloat(this.planillaUsuario.salarioBase));
    const aumentosTotal = this.sumMontos(this.aumentos);


    let otrosPagosTotal = 0;
    let deduccionesTotal = 0;

    let salarioBruto = 0;
    let totalDeducciones = 0;
    let subTotal = 0;
    let salarioNeto = 0;
    let totalDeposito = 0;

    //Modificaciones de servicios profesionales
    if (this.planillaUsuario.usuarioIdTipoContrato === 2) {
      salarioBruto = aumentosTotal;
      
    //Actualizacion de otros pagos fijos
      this.otrosPagos = this.calculateFijos(this.otrosPagos, salarioBruto);
      otrosPagosTotal = this.sumMontos(this.otrosPagos);
      
      subTotal = salarioBruto + otrosPagosTotal;

  
    //Actualizacion de deducciones fijas
      this.deducciones = this.calculateFijos(this.deducciones, subTotal);
      deduccionesTotal = this.sumMontos(this.deducciones);

      totalDeducciones = deduccionesTotal;
      salarioNeto = subTotal - totalDeducciones;
      totalDeposito = salarioNeto;

    //Modificaciones de asalariados
    } else {
      salarioBruto = this.stringToFloat(this.planillaUsuario.salarioBase) + aumentosTotal;

      //Actualizacion de deducciones fijas
      this.deducciones = this.calculateFijos(this.deducciones, salarioBruto);
      deduccionesTotal = this.sumMontos(this.deducciones);

      totalDeducciones = deduccionesTotal;
      salarioNeto = salarioBruto - totalDeducciones;
      

      //Actualizacion de otros pagos fijos
      this.otrosPagos = this.calculateFijos(this.otrosPagos, salarioNeto);
      otrosPagosTotal = this.sumMontos(this.otrosPagos);
      
      totalDeposito = salarioNeto + otrosPagosTotal;
    }

    this.planillaUsuario.salarioBruto = this.formatearNumero(salarioBruto.toString());
    this.planillaUsuario.totalDeducciones = this.formatearNumero(totalDeducciones.toString());
    this.planillaUsuario.subTotal = this.formatearNumero(subTotal.toString());
    this.planillaUsuario.salarioNeto = this.formatearNumero(salarioNeto.toString());
    this.planillaUsuario.totalDeposito = this.formatearNumero(totalDeposito.toString());
  }

  calculateFijos(lista: any[], variable: number) {
    return lista.map(item => {
      if (item.fijo === 1) {
        const valor = variable * item.valor / 100;
        item.monto = valor.toString();
      }
      return item;
    });;
  }

  sumMontos(lista: any[]) {
    return lista.reduce((sum, item) => sum + this.stringToFloat(item.monto), 0);
  }

  stringToFloat(valor: string): number {
    let perFormateado = (valor+'').replace(/,/g, '.');
    return parseFloat(perFormateado.replace(/[^\d.-]/g, ''))
  }

  onEnterPressed(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      const currentElement = event.target as HTMLElement;
  
      let nextElement = currentElement.closest('.planilla-item')?.nextElementSibling?.querySelector('.editable');
  
      if (nextElement) {
        (nextElement as HTMLElement).focus();
      } else {
        nextElement = currentElement.closest('.planilla-left')?.nextElementSibling?.querySelector('.editable');

        if (nextElement) {
          (nextElement as HTMLElement).focus();
        } else {
          nextElement = currentElement.closest('.planilla-right')?.previousElementSibling?.querySelector('.editable');
          
          if (nextElement) {
            (nextElement as HTMLElement).focus();
          }
        }
      }
    }
  }

  openAnotacionDialog() {
    let width = '600px';
    let data = { 
      isCrear: true,
      planillaUsuario: this.planillaUsuario,
      descripcion: 'Cambio de administrador',
      idUsuarioActual: this.idUsuarioActual
    };
    
    const dialogRef = this.dialog.open(PlanillaAnotacionFormDialogComponent, {
      data,
      width,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (let res of result) {
          const collections = [this.aumentos, this.deducciones, this.otrosPagos];
          
          for (let collection of collections) {
            let item = collection.find(a => a.anotacionId === res.idAnotacion);
            if (item) {
              item.monto += res.monto;
            }
          }

          this.newAnotaciones.push(res);
        }

        this.updateSalarios();
      }
    });
  }

  cerrarDialog() {
    if (this.newAnotaciones.length > 0 || this.modificarSalario && this.stringToFloat(this.modificarSalario) != this.stringToFloat(this.planillaUsuario.salarioBase)) {
      this.confirmationService.confirm("Hay cambios sin guardar. ¿Está seguro que desea salir?")
      .subscribe(result => {
        if (result) {
          this.dialogRef.close(false);
        }
      });
    } else {
      this.dialogRef.close(false);
    }
  }

  guardarPlanilla() {
    const salarioPromise = (this.modificarSalario || this.modificarSalario == 0) && this.stringToFloat(this.modificarSalario) != this.stringToFloat(this.salarioInicial) ? this.actualizarSalario() : Promise.resolve();
    const anotacionesPromise = this.newAnotaciones.length > 0 ? this.crearAnotaciones() : Promise.resolve();
    Promise.all([salarioPromise, anotacionesPromise])
    .then(() => {
      this.alerta.mensaje('Planilla', 'Cambios realizados correctamente', TipoMessage.success);
      this.dialogRef.close(true);
    })
    .catch(error => {
      console.error("Error en cambios de planilla:", error);
      this.alerta.mensaje('Planilla', 'Hubo un error al actualizar la planilla', TipoMessage.error);
    });
  }

  actualizarSalario(): Promise<any> {
    return new Promise((resolve, reject) => {
      const datos = {
        salarioBase: this.modificarSalario
      }
      this.gService.put2(`planillaUsuario/salario/${this.planillaUsuario.id}`, datos)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  crearAnotaciones(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`planillaUsuarioAnotacion/multiple`, this.newAnotaciones)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
}

