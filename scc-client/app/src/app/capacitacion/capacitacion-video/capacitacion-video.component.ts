import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { CapacitacionVideoPlayerComponent } from "../capacitacion-video-player/capacitacion-video-player.component";

@Component({
    selector: 'app-capacitacion-video',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule, MatTooltipModule, CapacitacionVideoPlayerComponent],
    templateUrl: './capacitacion-video.component.html',
    styleUrl: './capacitacion-video.component.scss',
})
export class CapacitacionVideoComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  tituloModulo: any;

  usuarioActual: any;
  videoId: any;
  moduloId: any;

  moduloVideos: any;
  videoActual: any;
  posicionActual: any;

  usuarioVideo: any;
  youtubeVideo: any;

  descEllipsis: any;

  constructor(
    private gService: GenericService,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificacion: NotificacionService,
    private sanitizer: DomSanitizer
  ) {
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.videoId = params.get('idVideo');
      this.moduloId = params.get('idModulo');
      
      this.authService.usuarioActual.subscribe((x) => {
        if (x && Object.keys(x).length !== 0) {
          this.usuarioActual = x.usuario;

          this.cargarDatos();
        } else {
          this.usuarioActual = null;
        }
      });

    });
  }

  cargarDatos() {
    this.gService.get(`usuarioVideo/${this.usuarioActual.id}/${this.videoId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data) {
          this.usuarioVideo = res.data
        } else {
          const createData = {
            idUsuario: this.usuarioActual.id,
            idVideo: this.videoId
          }
          this.gService.post(`usuarioVideo`, createData)
          .pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
              this.gService.get(`usuarioVideo/${res.data.insertId}`)
              .pipe(takeUntil(this.destroy$)).subscribe({
                next: (res) => {
                  if (res.data) {
                    this.usuarioVideo = res.data
                    this.tituloModulo = this.usuarioVideo;
                  }
                }
              });
            }
          });
        }
      }
    });
    
    this.gService.get(`moduloVideo/modulo/${this.moduloId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data) {
          this.moduloVideos = res.data;
          console.log(this.moduloVideos)
          console.log(this.videoId)
          this.videoActual = this.moduloVideos.find((mv, index) => {
            if (mv.idVideo == this.videoId) {
              this.posicionActual = index;
              return true;
            }
            return false;
          });
        }
      }
    });
  }

  anteriorVideo() {
    if (this.posicionActual > 0) {
      const moduloVideoAnterior = this.moduloVideos[this.posicionActual - 1];

      this.router.navigate(['capacitacion/video', moduloVideoAnterior.idVideo, moduloVideoAnterior.idModulo]);
    }
  }

  siguienteVideo() {
    if (this.posicionActual < this.moduloVideos.length - 1) {
      const moduloVideoSiguiente = this.moduloVideos[this.posicionActual + 1];

      this.router.navigate(['capacitacion/video', moduloVideoSiguiente.idVideo, moduloVideoSiguiente.idModulo]);
    }
  }
}
