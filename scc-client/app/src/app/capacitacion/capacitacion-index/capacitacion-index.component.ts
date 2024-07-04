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
import { MatIcon } from '@angular/material/icon';
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
import { Subject, takeUntil } from 'rxjs';

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
    MatIcon, 
    MatCardModule, 
    MatTooltipModule, 
    MatAccordion, 
    MatExpansionModule, 
    MatTabsModule,
    MatSelectModule,
    MatGridListModule, 
    MatCheckboxModule],
  templateUrl: './capacitacion-index.component.html',
  styleUrl: './capacitacion-index.component.scss'
})
export class CapacitacionIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  modulos: any;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    private httpClient:HttpClient,
    private dialog: MatDialog
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
    this.gService.get('usuarioModulo/usuario/' + this.usuarioActual.id)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res.data && res.data.length > 0) {
          this.modulos = res.data

          this.modulos.forEach(modulo => {
            this.gService.get('moduloVideo/moduloGroup/' + modulo.idModulo)
            .pipe(takeUntil(this.destroy$)).subscribe({
              next:(res) => {
                modulo.videos = res.data;
                
                modulo.videos.forEach(niveles => {
                  niveles.moduloVideos.forEach(video => {
                    video.videoThumbnail = this.getThumbnailUrl(video.videoLink)
                  });
                });

              }
            });
          });
          console.log(this.modulos)
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
}
