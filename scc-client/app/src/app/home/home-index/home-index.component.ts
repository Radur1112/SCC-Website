import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../services/confirmation.service';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConvertLineBreaksService } from '../../services/convert-line-breaks.service';

@Component({
  selector: 'app-home-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatRadioModule, MatSelectModule, MatMenuModule, MatListModule],
  templateUrl: './home-index.component.html',
  styleUrl: './home-index.component.scss'
})
export class HomeIndexComponent {

  usuarioActual: any;
  nombreUsuario: string;
  isAdmin: boolean;
  isSupervisor: boolean;
  isCapacitador: boolean;
  isPlanillero: boolean;
  isVacaciones: boolean;

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private alerta: AlertaService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public convertService: ConvertLineBreaksService,
  ) {
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
        this.nombreUsuario = this.usuarioActual.nombre;

        this.isAdmin = this.usuarioActual.idTipoUsuario == 1;
        this.isSupervisor = this.usuarioActual.idTipoUsuario == 3 || this.usuarioActual.idTipoUsuario == 1;
        this.isCapacitador = this.usuarioActual.idTipoUsuario == 4 || this.usuarioActual.idTipoUsuario == 1;
        this.isPlanillero = this.usuarioActual.idTipoUsuario == 5 || this.usuarioActual.idTipoUsuario == 1;
      } else {
        this.usuarioActual = null;
        this.isAdmin = false;
        this.isSupervisor = false;
        this.isCapacitador = false;
        this.isPlanillero = false;
      }
    });
  }
}
