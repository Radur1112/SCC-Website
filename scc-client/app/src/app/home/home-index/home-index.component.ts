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
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatDividerModule, MatButtonModule, MatInputModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatRadioModule, MatSelectModule, MatMenuModule, MatListModule],
  templateUrl: './home-index.component.html',
  styleUrl: './home-index.component.scss'
})
export class HomeIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  nombreUsuario: string;
  isAdmin: boolean;
  isSupervisor: boolean;
  isCapacitador: boolean;
  isPlanillero: boolean;
  isVacaciones: boolean;

  home: any;
  foros: any[] = [];
  modulos: any[] = [];
  vacaciones: any[] = [];
  incapacidades: any[] = [];
  planillas: any[] = [];

  estados = {
    0: 'Rechazado',
    1: 'Confirmado',
    2: 'Pendiente'
  };

  loading: boolean = true;

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

        this.getHome();
      } else {
        this.usuarioActual = null;
        this.isAdmin = false;
        this.isSupervisor = false;
        this.isCapacitador = false;
        this.isPlanillero = false;
      }
    });
  }

  getHome() {
    this.gService.get(`usuario/home/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.home = res.data;
        this.foros = this.home.foros;
        this.modulos = this.home.modulos;
        this.vacaciones = res.data.vacaciones.map(vacacion => ({
          ...vacacion,
          estadoTexto: this.estados[vacacion.estado]
        }));
        this.incapacidades = res.data.incapacidades.map(vacacion => ({
          ...vacacion,
          estadoTexto: this.estados[vacacion.estado]
        }));
        this.planillas = this.home.planillas;

        this.loading = false;
      }
    });
  }

  getRelativeTime(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  }

  formatearNumero(valor: string) {
    valor = valor ?? '';
    let perFormateado = valor.replace(/,/g, '.');
    let formateado = parseFloat(perFormateado.replace(/[^\d.-]/g, ''));
    
    if (isNaN(formateado)) {
      return '0.00';
    }

    const parts = formateado.toFixed(2).split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${integerPart},${decimalPart}`;
  }
}
