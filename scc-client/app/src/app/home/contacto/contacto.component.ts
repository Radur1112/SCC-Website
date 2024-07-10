import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatListModule, ReactiveFormsModule, MatInputModule, MatSelectModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss'
})
export class ContactoComponent {
  contactoForm: FormGroup
  
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private gService: GenericService,
    private notificacion: NotificacionService
  ) {
    this.reactiveForm();
  }
  
  redirectToPage(url: string): void {
    window.open(url, '_blank');
  }
  
  reactiveForm() {
    this.contactoForm = this.fb.group({
      identificacion: ['',[Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      telefono: ['', [Validators.required, , Validators.pattern(/^(\d{4})-(\d{4})$/)]],
      asunto: ['',[Validators.required, Validators.maxLength(20)]],
      mensaje: ['',[Validators.required, Validators.maxLength(3000)]]
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.contactoForm.controls[control].hasError(error);
  };

  formatearTelefono() {
    const telefono = this.contactoForm.get('telefono');

    //Remover no digitos de telefono
    const digitos = telefono.value.replace(/\D/g, '');
    
    //Agregar guión si hay más de 4 dígitos
    let res = '';
    if (digitos.length > 4) {
      res = digitos.slice(0, 4) + '-' + digitos.slice(4, 8);
    } else {
      res = digitos;
    }

    //Actualizar valor
    telefono.setValue(res);
  }

  enviarMensaje() {
    if(this.contactoForm.invalid){
      return;
    }
    this.contactoForm.value.asunto = this.crearAsunto();

    this.gService.post(`contacto`, this.contactoForm.value).subscribe(response => {
      this.notificacion.mensaje('Información', response.toString(), TipoMessage.success);
      this.contactoForm.reset();
    });
  }

  crearAsunto() {
    let asunto: string;
    switch(this.contactoForm.value.asunto) {
      case 'consulta':
        asunto = "Consulta General"
        break;
      case 'servicios':
        asunto = "Información sobre Servicios"
        break;
      case 'reclamo':
        asunto = "Queja o Reclamo"
        break;
      case 'otro':
        asunto = "Otro"
        break;
      default:
    }
    return asunto;
  }
}
