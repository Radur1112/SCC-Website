import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatPaginator, MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificacionService, TipoMessage } from '../../services/notification.service';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
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

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    private httpClient:HttpClient,
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
    this.gService.get(`usuarioModulo/usuario/all/${this.usuarioActual.id}` )
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.modulos = res.data

          this.modulos.forEach(modulo => {
            modulo.ellipsis = false;
            modulo.progreso = modulo.progreso ?? '0.00';
            this.progresoTotal += parseFloat(modulo.progreso);
            modulo.videosByModulo.forEach(item => {
              if (item.videos) {
                item.videos.forEach(video => {
                  video.videoThumbnail = this.getThumbnailUrl(video.videoLink);
                  video.videoProgreso = video.videoProgreso ?? parseFloat('0.00');
                });
              }
            });
          });
          
          this.progresoTotal /= this.modulos.length;
          this.filtroModulos = this.modulos;
        }
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
}
