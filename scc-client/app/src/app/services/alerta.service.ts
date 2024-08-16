import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
export enum TipoMessage{
  error,
  info,
  success,
  warning,
}
@Injectable({
  providedIn: 'root',
})

export class AlertaService {
  options: Partial<IndividualConfig>; // Use Partial to make all options optional

  constructor(private toastr: ToastrService) {
    // Initialize options with default values
    this.options = {
      enableHtml: true,
      positionClass: 'toast-top-center',
      timeOut: 8000,
      closeButton: true,
    };
  }

  public mensaje(titulo: string, mensaje: string, tipo: TipoMessage) {
    this.toastr.show(mensaje, titulo, this.options, 'toast-' + TipoMessage[tipo]);
  }
}
