import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { addDays } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { ForoFormDialogComponent } from '../foro-form-dialog/foro-form-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-foro-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule, MatTooltipModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatMenuModule],
  templateUrl: './foro-index.component.html',
  styleUrl: './foro-index.component.scss',
  providers: [DatePipe]
})
export class ForoIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  usuarioActual: any;
  isAdmin: any;
  
  tipoForos: any;
  foros: any;

  filtroForos: any;

  filtro: any = '';
  selectedTipo: any;
  readonly selectedFecha = new FormGroup({
    inicio: new FormControl<Date | null>(null),
    fin: new FormControl<Date | null>(null),
  });

  maxDate: Date;
  minDate: Date;
  
  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private notificacion: NotificacionService,
    private dialog: MatDialog,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _adapter: DateAdapter<any>,
  ) {
    this._locale = 'cr';
    this._adapter.setLocale(this._locale);

    const currentDate = new Date();
    this.minDate = new Date(2024, 6, 15);
    this.maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, currentDate.getDate());
    
    this.getTipoForos();
    this.getForos();
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
        this.isAdmin = this.usuarioActual.idTipoUsuario == 1;
      } else {
        this.usuarioActual = null;
        this.isAdmin = false;
      }
    });
  }

  getTipoForos() {
    this.gService.get(`tipoForo`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipoForos = res.data;
      }
    });
  }

  getForos() {
    this.gService.get(`foro`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.foros = res.data;
        this.filtroForos = this.foros;
      }
    });
  }

  busqueda(event: Event) {
    let tipo: any;
    let fecha: any;

    if (event !== null)
      this.filtro = (event.target as HTMLInputElement).value;
    if (this.selectedTipo)
      tipo = this.selectedTipo;
    if (this.selectedFecha.value.inicio && this.selectedFecha.value.fin)
      fecha = this.selectedFecha;


    this.filtroForos = this.foros.filter(foro => {
      const coincideTitulo = foro.titulo.trim().toLowerCase().includes(this.filtro.trim().toLowerCase());

      const coincideTipo = tipo ? foro.idTipoForo === tipo.id : true;

      const coincideFecha = fecha ?  this.enFecha(new Date(foro.fechaCreado), fecha.value.inicio, addDays(fecha.value.fin, 1)) : true;

      return coincideTitulo && coincideTipo && coincideFecha;
    });
  }

  enFecha(fecha: Date, inicio: Date, fin: Date): boolean {
    return fecha >= inicio && fecha <= fin;
  }

  openForoFormDialog(crear: any) {
    let width = '800px';
    let data = { 
      crear: crear,
    };
    
    const dialogRef = this.dialog.open(ForoFormDialogComponent, {
      data,
      width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearForo(result);
      }
    });
  }

  crearForo(foro: any) {
    this.gService.post(`foro`, foro)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (foro.archivos.length > 0) {
          const formData = new FormData();
          formData.append('idForo', res.data.insertId,);
      
            foro.archivos.forEach((file, index) => {
              formData.append(`archivo`, file, file.name);
            });

          this.gService.post(`foro/archivos`, formData)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.getForos();
              this.notificacion.mensaje('Foro', 'Foro creado correctamente', TipoMessage.success);
            }
          });
        } else {
          this.getForos();
          this.notificacion.mensaje('Foro', 'Foro creado correctamente', TipoMessage.success);
        }
      }
    });
  }

  abrirForo(foro: any) {
    this.router.navigate(['/foro/detalle', foro.id]);
  }

  borrarForo(foro: any) {
    this.confirmationService.confirm()
      .subscribe(result => {
        if (result) {
          this.gService.put(`foro/borrar`, foro)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next:(res) => {
              this.notificacion.mensaje('Foro', 'Foro eliminado correctamente', TipoMessage.success);
              this.getForos();
            },
            error:(err) => {
              console.log(err);
            }
          });
        }
      });
  }
}
