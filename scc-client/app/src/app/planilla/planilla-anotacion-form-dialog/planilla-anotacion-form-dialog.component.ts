import { Component, ElementRef, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-planilla-anotacion-form-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, MatTooltipModule, MatSelectModule, MatDialogModule],
  templateUrl: './planilla-anotacion-form-dialog.component.html',
  styleUrl: './planilla-anotacion-form-dialog.component.scss'
})
export class PlanillaAnotacionFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  anotacionForm: FormGroup;
  
  planillaUsuario: any;
  anotaciones: any;

  idUsuarioActual: any;
  isCrear: boolean;
  anotacionId: number;
  descripcion: string;
  monto: number;

  horasQuincena: any = 30 * 8 / 2;
  
  @ViewChild('hora') inputElement!: ElementRef<HTMLInputElement>;

  numInputs: number = 0;

  agregados: any[] = [];
  
  constructor(
    private gService: GenericService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaAnotacionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isCrear = data.isCrear;
    this.planillaUsuario = data.planillaUsuario;
    this.descripcion = data.descripcion;
    this.monto = data.monto;
    this.anotacionId = data.anotacionId;
    this.idUsuarioActual = data.idUsuarioActual;
    
    this.reactiveForm();
    this.getAnotaciones();
  }
  
  reactiveForm() {
    this.anotacionForm = this.fb.group({
      anotacion: [{value: '', disabled: this.anotacionId}, Validators.required],
      descripcion: [this.descripcion, [Validators.required, Validators.maxLength(100)]],
      hora: ['--:--'],
      monto: [this.monto, [Validators.required, Validators.min(0), Validators.max(999999999), Validators.pattern(/^\d+(\s*\d+)*\s*[.,]?\s*\d{0,2}$/)]]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.anotacionForm.controls[control].hasError(error);
  };

  getAnotaciones() {
    this.gService.get(`anotacion/group/tipoContrato/${this.planillaUsuario.usuarioIdTipoContrato}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.anotaciones = res.data;

        if (!this.isCrear) {
          const aumento = this.anotaciones[0].anotaciones.find(a => a.id == this.anotacionId);
          const deduccion = this.anotaciones[1].anotaciones.find(a => a.id == this.anotacionId);
          const otroPago = this.anotaciones[2].anotaciones.find(a => a.id == this.anotacionId);

          this.anotacionForm.get('anotacion').setValue(aumento || deduccion || otroPago);
        }
      }
    });
  }

  formatearMonto() {
    const monto = this.anotacionForm.get('monto');
    monto.setValue(this.stringToFloat(monto.value).toFixed(2));
  }

  calcularMonto() {
    const anotacion = this.anotacionForm.get('anotacion');
    const hora = this.anotacionForm.get('hora');
    const monto = this.anotacionForm.get('monto');

    if (anotacion && hora && anotacion.value && hora.value && !hora.value.includes('-')) {
      const [hours, minutes] = hora.value.split(':').map(Number);
      const horasTotales = hours + minutes / 60;

      const salarioXhora = this.stringToFloat(this.planillaUsuario.salarioBase) / (this.horasQuincena) * (anotacion.value.valorHoras);

      monto.setValue((horasTotales * salarioXhora).toFixed(2));
    }
  }

  stringToFloat(valor: string): number {
    let perFormateado = valor.replace(/,/g, '.');
    return parseFloat(perFormateado.replace(/[^\d.-]/g, ''))
  }

  agregarAnotacion() {
    const data = {
      idPlanillaUsuario: this.planillaUsuario.id,
      idAnotacion: this.anotacionForm.value.anotacion.id,
      anotacionDescripcion: this.anotacionForm.value.anotacion.descripcion,
      descripcion: this.anotacionForm.value.descripcion,
      monto: this.stringToFloat(this.anotacionForm.value.monto),
      idUsuario: this.idUsuarioActual
    }

    this.agregados.push(data);
    this.alerta.mensaje('Anotacion', 'Anotacion agregada correctamente', TipoMessage.success);
  }

  borrarAgregado(index: number) {
    this.agregados.splice(index, 1)
  }

  guardarAnotacion() {
    if (this.isCrear) {
      this.dialogRef.close(this.agregados);
    } else {
      const data = {
        id: this.planillaUsuario.id,
        idPlanillaUsuario: this.planillaUsuario.idPlanillaUsuario,
        idAnotacion: this.anotacionId,
        descripcion: this.anotacionForm.value.descripcion,
        monto: this.stringToFloat(this.anotacionForm.value.monto),
        idUsuario: this.idUsuarioActual
      }

      this.dialogRef.close(data);
    }
  }

  cerrarDialog() {
    if (this.agregados.length > 0) {
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

  agregarAnotacionEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.isCrear) {
        this.agregarAnotacion();
      } else {
        this.guardarAnotacion();
      }
    }
  }

  selectFirst(event: FocusEvent) {
    const input = event.target as HTMLInputElement;

    input.setSelectionRange(0, 0);
    input.setSelectionRange(0, 2);
    
    event.preventDefault();
  }

  selectText(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    
    this.numInputs = 0;
    if (input.selectionStart !== null && input.selectionEnd !== null) {
      if (input.selectionStart <= 2) {
        input.setSelectionRange(0, 0);
        input.setSelectionRange(0, 2);
      } 
      else if (input.selectionStart > 2) {
        input.setSelectionRange(0, 0);
        input.setSelectionRange(3, 5);
      }
    }
    event.preventDefault();
  }
  
  onInputChange(event: any) {
    const input = (event as KeyboardEvent).target as HTMLInputElement;
    let inputValue = input.value;

    if (inputValue.slice(0, 2) == '0:') {
      inputValue = '0' + inputValue;
    }
    if (inputValue.slice(3) == '0') {
      inputValue = inputValue + '0';
    }
    if (inputValue.slice(3).length == 1) {
      inputValue = inputValue + inputValue.slice(3);
    }

    if (inputValue.length < 5) {
      inputValue = this.restaurarHora(inputValue);
    }

    this.anotacionForm.get('hora').setValue(inputValue);
    this.inputElement.nativeElement.value = inputValue;
  }

  restaurarHora(inputValue: any): string {
    if (inputValue.includes(':')) {
      while (inputValue.indexOf(':') != 2) {
        inputValue = '-' + inputValue
      }

      while (inputValue.length < 5) {
        inputValue += '-'
      }
    } else {
      inputValue = '--:--'
    }
    return inputValue;
  }

  onKeyDown(event: any) {
    const input = (event as KeyboardEvent).target as HTMLInputElement;
    let inputValue = input.value;

    // Allow numeric keys, navigation keys, and selection
    const allowedKeys = [
      'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    if (!allowedKeys.includes(event.key) && event.key.length === 1) {
      event.preventDefault();
    }

    switch(event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.numInputs++;
        
        if (input.selectionStart == 0 && input.selectionEnd == 2) {
          if (this.numInputs == 1) {
            inputValue = this.reemplazarChar(inputValue, 1, event.key)
            
            this.selectionStart();
          } else {
            inputValue = this.reemplazarChar(inputValue, 1, event.key);
            
            this.selectionEnd();
            this.numInputs = 0;
          }
        } else if (input.selectionStart == 3 && input.selectionEnd == 5) {
          if (this.numInputs == 1) {
            inputValue = this.reemplazarChar(inputValue, 2, event.key)
            
            this.selectionEnd();
          } else {
            inputValue = this.reemplazarChar(inputValue, 2, event.key)

            this.selectionEnd();
            this.numInputs = 0;
          }
        }
        break;
      case 'ArrowLeft':
        this.selectionStart();
        this.numInputs = 0;
        break;
      case 'ArrowRight':
        this.selectionEnd();
        this.numInputs = 0;
        break;
      case 'Backspace':
      case 'Delete':
        if (input.selectionStart == 3 && input.selectionEnd == 5) {
          this.selectionEnd();
        } else  {
          this.selectionStart();
        }
        this.numInputs = 0;
        break;
      default:
    }

    this.anotacionForm.get('hora').setValue(inputValue);
    this.inputElement.nativeElement.value = inputValue;
  }

  selectionStart() {
    setTimeout(() => {
      const input = this.inputElement.nativeElement;
      input.setSelectionRange(0, 2);
    }, 0);
  }
  selectionEnd() {
    setTimeout(() => {
      const input = this.inputElement.nativeElement;
      input.setSelectionRange(3, 5);
    }, 0);
  }

  reemplazarChar(valor: string, index: number, char: string): string {
    if (index == 1) {
      let hours = valor.slice(1, 2) + char;
      return hours.replace('-', '0') + valor.slice(2);
    } else {
      let minutos = valor.slice(4) + char;
      return  valor.slice(0, 3) + minutos.replace('-', '0');
    }
  }

  postAjuste(event: any) {
    const input = (event as KeyboardEvent).target as HTMLInputElement;
    let inputValue = input.value;
    
    if (parseInt(inputValue.slice(3)) > 59) {
      inputValue = inputValue.slice(0, 3) + '59';
    }

    this.anotacionForm.get('hora').setValue(inputValue);
    this.inputElement.nativeElement.value = inputValue;

    this.calcularMonto();
  }
}
