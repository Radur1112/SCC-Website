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

@Component({
  selector: 'app-planilla-supervisor-anotacion-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, MatTooltipModule, MatSelectModule, MatDialogModule],
  templateUrl: './planilla-supervisor-anotacion-dialog.component.html',
  styleUrl: './planilla-supervisor-anotacion-dialog.component.scss'
})
export class PlanillaSupervisorAnotacionDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  anotacionForm: FormGroup;
  
  planilla: any;
  tipos: any;

  idUsuarioActual: any;

  tablaTipo: any;

  horasQuincena: any = 30 * 8 / 2;
  
  @ViewChild('hora') inputElement!: ElementRef<HTMLInputElement>;

  numInputs: number = 0;
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PlanillaSupervisorAnotacionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idUsuarioActual = data.idUsuarioActual;
    this.planilla = data.planilla;
    
    this.reactiveForm();
    this.getTipos();
  }
  
  reactiveForm() {
    this.anotacionForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      hora: ['--:--'],
      monto: ['', Validators.required]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.anotacionForm.controls[control].hasError(error);
  };

  getTipos() {
    let query = '';
    if (this.planilla.usuarioIdTipoContrato == 1) {
      query = 'planilla/tipos/asalariado'
    } else {
      query = 'planilla/tipos/sp'
    }
    this.gService.get(query)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipos = res.data;
      }
    });
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

    if (input.selectionEnd === 2 && event.key == 'Delete' || input.selectionEnd === 3 && event.key == 'Backspace') {
      event.preventDefault();
    }

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
      inputValue = inputValue.slice(0, 2) + '59';
    }

    this.anotacionForm.get('hora').setValue(inputValue);
    this.inputElement.nativeElement.value = inputValue;
  }

  selectText(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    
    this.numInputs = 0;
    if (input.selectionStart !== null && input.selectionEnd !== null) {
      // Select the first two characters if clicked on the first part
      if (input.selectionStart <= 2) {
        input.setSelectionRange(0, 0);
        input.setSelectionRange(0, 2);
      } 
      // Select the last two characters if clicked on the last part
      else if (input.selectionStart > 2) {
        input.setSelectionRange(0, 0);
        input.setSelectionRange(3, 5);
      }
    } else {
      input.setSelectionRange(0, 0);
      input.setSelectionRange(0, 2);
    }
    event.preventDefault();
  }

  calcularMonto(event?: any) {
    if (event && event.value) {
      const selectedValue = event.value;
      this.tablaTipo = this.tipos.find(group =>
        group.lista.some(option => option === selectedValue)
      );
    }
    
    const tipo = this.anotacionForm.get('tipo');
    const hora = this.anotacionForm.get('hora');
    const monto = this.anotacionForm.get('monto');

    if (tipo && hora && tipo.value && hora.value && !hora.value.includes('-')) {
      const [hours, minutes] = hora.value.split(':').map(Number);
      const horasTotales = hours + minutes / 60;

      const salarioXhora = this.planilla.salarioBase / (this.horasQuincena) * (tipo.value.valorHoras);

      monto.setValue((horasTotales * salarioXhora).toFixed(2));
    }
  }

  guardarAnotacion() {
    const data = {
      idPlanilla: this.planilla.id,
      idTipo: this.anotacionForm.value.tipo.id,
      descripcion: this.anotacionForm.value.descripcion,
      monto: this.anotacionForm.value.monto,
      idUsuario: this.idUsuarioActual
    }
    
    const tabla = this.tablaTipo.tipo == 'Aumentos' ? 'aumento' : this.tablaTipo.tipo == 'Deducciones' ? 'deduccion' : 'otroPago'

    this.gService.post(`${tabla}`, data)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.alerta.mensaje('Anotacion', 'Anotacion creada correctamente', TipoMessage.success);
        this.dialogRef.close(true);
      }
    });
  }
}
