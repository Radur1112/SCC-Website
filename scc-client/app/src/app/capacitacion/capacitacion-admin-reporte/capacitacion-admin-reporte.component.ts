import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConvertLineBreaksService } from '../../services/convert-line-breaks.service';


@Component({
  selector: 'app-capacitacion-admin-reporte',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule, 
    MatIconModule, 
    MatCardModule, 
    MatTooltipModule, 
    MatAccordion, 
    MatExpansionModule, 
    MatTabsModule,
    MatSelectModule,
    MatGridListModule, 
    MatCheckboxModule,
    MatProgressBarModule],
  templateUrl: './capacitacion-admin-reporte.component.html',
  styleUrl: './capacitacion-admin-reporte.component.scss'
})
export class CapacitacionAdminReporteComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  datos: any;
  filtro: any;

  viewModulos: boolean = true;
  
  @ViewChild('buscar') buscarInput: ElementRef;
  
  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private router:Router,
    private dialog: MatDialog,
    public convertService: ConvertLineBreaksService
  ){
    this.getReporte();
  }

  getReporte() {
    this.loading = true;
    this.gService.get(`modulo/reporte`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.datos = res.data;

        this.loading = false;
        this.changeFiltro();
      }
    });
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    if (this.viewModulos) {
      this.filtro = this.datos.modulos.filter(m => m.titulo.trim().toLowerCase().includes(filterValue.trim().toLowerCase()));
    } else {
      this.filtro = this.datos.usuarios.filter(u => u.nombre.trim().toLowerCase().includes(filterValue.trim().toLowerCase()));
    }
  }

  changeFiltro() {
    if (this.viewModulos) {
      this.filtro = this.datos.modulos;
    } else {
      this.filtro = this.datos.usuarios;
    }
    this.buscarInput.nativeElement.value = '';
  }

  stringToFloat(valor: string) {
    let perFormateado = (valor+'').replace(/,/g, '.');
    return parseFloat(perFormateado.replace(/[^\d.-]/g, '')).toFixed(2);
  }

  navegarQuiz(idQuiz: any) {
    this.router.navigate(['capacitacion/usuarioQuiz', idQuiz]);
  }
}
