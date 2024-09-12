import { Component } from '@angular/core';
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
  selector: 'app-capacitacion-index',
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
  templateUrl: './capacitacion-index.component.html',
  styleUrl: './capacitacion-index.component.scss'
})
export class CapacitacionIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  modulos: any;
  filtroModulos: any;
  progresoTotal: any = 0;

  checkpoints = [20, 50, 80];

  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private router:Router,
    private dialog: MatDialog,
    public convertService: ConvertLineBreaksService
  ){

  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;

        this.cargarModulos();
      } else {
        this.usuarioActual = null;
      }
    });
  }

  cargarModulos() {
    this.loading = true;
    this.gService.get(`usuarioModulo/usuario/all/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.modulos = res.data

          this.modulos.forEach(modulo => {
            modulo.ellipsis = false;
            modulo.progreso = modulo.progreso ?? '0.00';
            this.progresoTotal += parseFloat(modulo.progreso);
            if (modulo.videosByModulo) {
              modulo.videosByModulo.forEach(item => {
                if (item.videos) {
                  item.videos.forEach(video => {
                    video.videoThumbnail = this.getThumbnailUrl(video.videoLink);
                    video.videoProgreso = video.videoProgreso ?? parseFloat('0.00');
                  });
                }
              });
            }
          });
          
          this.progresoTotal /= this.modulos.length;
          this.filtroModulos = this.modulos;
        }
        
        this.loading = false;
      }
    });
  }

  getThumbnailUrl(link: string): string {
    if (link) {
      const videoId = this.extractVideoId(link);
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } 
    return null
  }

  private extractVideoId(url: string): string {
    const longUrlMatch = url.match(/[?&]v=([^&]+)/);

    if (longUrlMatch && longUrlMatch[1]) {
      return longUrlMatch[1];
    } else {
      const shortUrlMatch = url.match(/youtu\.be\/([^?]+)/);

      return shortUrlMatch ? shortUrlMatch[1] : '';
    }
  }

  busqueda(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.filtroModulos = this.modulos.filter(m => m.moduloTitulo.trim().toLowerCase().includes(filterValue.trim().toLowerCase()));
  }

  abrirVideo(idVideo: any, idModulo: any) {
    this.router.navigate(['capacitacion/video', idVideo, idModulo]);
  }

  hacerQuiz(quiz: any) {
    const datos = {
      idQuiz: quiz.id,
      idUsuario: this.usuarioActual.id
    }
    this.gService.post(`usuarioQuiz/vacio`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.navegarQuiz(quiz.id);
      }
    });
  }

  navegarQuiz(idQuiz: any) {
    this.router.navigate(['capacitacion/quiz', idQuiz]);
  }
}
