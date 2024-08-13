import { Component, OnInit, Input, OnDestroy, AfterViewInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { format, toZonedTime } from 'date-fns-tz';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-capacitacion-video-player',
  standalone: true,
  imports: [],
  templateUrl: './capacitacion-video-player.component.html',
  styleUrl: './capacitacion-video-player.component.scss'
})
export class CapacitacionVideoPlayerComponent implements OnDestroy, AfterViewInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  @Input() videoUrl: string;
  @Input() usuarioVideo: any;
  @Output() progresoChange = new EventEmitter<number>();
  
  player: YT.Player;
  videoId: string;
  checkInterval: any;

  initialProgress: number = 0;
  videoDuration: any;

  previousTime: any;
  previousPercentage: any = 0;
  penalization: any = 0;
  watchedTime: any = 0;
  checkpoints: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
  completedCheckpoints: number[] = [];
  completado: boolean = false;

  constructor(
    private gService: GenericService,
    private route: ActivatedRoute
  ) {
  }

  ngAfterViewInit(): void {
    this.setupComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && !changes['videoUrl'].firstChange) {
      this.setupComponent();
    }
  }

  ngOnDestroy(): void {
    this.stopTracking();

    this.guardarProgreso();
  }

  setupComponent(): void {
    this.initialProgress = parseFloat(this.usuarioVideo.progreso);
    this.completedCheckpoints = this.checkpoints.filter(checkpoint => checkpoint <= this.initialProgress);
    
    this.videoId = this.extractVideoId(this.videoUrl);
    
    this.loadPlayer();
  }

  extractVideoId(link: string): string | null {
    const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(videoIdRegex);
    return match ? match[1] : null;
  }

  loadPlayer(): void {
    if (typeof YT !== 'undefined' && YT && YT.Player) {
      this.loadYouTubeVideo();
    } else {
      window['onYouTubeIframeAPIReady'] = this.createPlayer.bind(this);
    }
  }

  loadYouTubeVideo(): void {
    const tempPlayer = new YT.Player('temp-player', {
      height: '0',
      width: '0',
      videoId: this.videoId,
      events: {
        'onReady': (event) => {
          this.videoDuration = event.target.getDuration();
          event.target.destroy();

          this.createPlayer();
        }
      }
    });
  }

  createPlayer(): void {
    let startTimeInSeconds = Math.floor(this.initialProgress * this.videoDuration / 100);
    if (this.player) {
      this.player.destroy();
    }
    this.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: this.videoId,
      playerVars: {
        start: startTimeInSeconds,
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
  }

  onPlayerReady(event: YT.PlayerEvent): void {
    // Optionally, start the video automatically
    // event.target.playVideo();
  }

  onPlayerStateChange(event: YT.OnStateChangeEvent): void {
    if (event.data === YT.PlayerState.PLAYING) {
      this.startTracking();
    } else {
      this.stopTracking();
    }
  }

  private startTracking(): void {
    this.track();
    this.checkInterval = setInterval(() => {
      this.track();
    }, 1000);
  }

  track() {
    const duration = this.player.getDuration();
    const currentTime = this.player.getCurrentTime();
    const currentPercentage = currentTime * 100 / duration;
    const interval = currentTime - (this.previousTime || 0);

    if (Math.abs(interval) > 1.25) {
      this.penalization += currentTime > this.previousTime ? Math.abs(interval) - 1 : -Math.abs(interval) - 1;
      this.penalization = Math.max(-1, this.penalization);
    }

    this.watchedTime = Math.max(0, this.watchedTime + interval);

    this.checkAndCompleteCheckpoints(currentPercentage);
    
    this.previousPercentage = currentPercentage;
    this.previousTime = currentTime;

    this.progresoChange.emit(this.saveProgreso());
  }

  private checkAndCompleteCheckpoints(currentPercentage: number): void {
    for (const checkpoint of this.checkpoints) {
      if (!this.completedCheckpoints.includes(checkpoint) &&
      this.previousPercentage <= checkpoint &&
      currentPercentage >= checkpoint) {
        const allPrecedingCompleted = this.checkpoints
          .slice(0, this.checkpoints.indexOf(checkpoint))
          .every(preceding => this.completedCheckpoints.includes(preceding));

          const verifiquinCheckpoints = this.checkpoints
            .slice(this.checkpoints.indexOf(checkpoint))
            .filter(preceding => preceding < currentPercentage);
  
        if (allPrecedingCompleted && verifiquinCheckpoints.length < 2) {
          this.completedCheckpoints.push(checkpoint);
          break;
        }
      }
    }
  }

  private stopTracking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  saveProgreso(): number {
    if (this.usuarioVideo.fechaCompletado || this.usuarioVideo.progreso >= 100 || this.watchedTime <= 0) {
      return this.usuarioVideo.progreso || 0;
    }
  
    const duration = this.player.getDuration();
    const rawProgreso = ((this.watchedTime - this.penalization) * 100 / duration) + this.initialProgress;
  
    // Determine the progress based on completed checkpoints
    let progreso = rawProgreso;
  
    for (const checkpoint of this.completedCheckpoints) {
      if (rawProgreso <= checkpoint) {
        break;
      }
      progreso = rawProgreso;
    }
  
    // Final adjustment for progreso
    if (progreso === rawProgreso) {
      if (rawProgreso > 95 || this.completado) {
        this.completado = true;
        progreso = 100;
      } else if (this.completedCheckpoints.length > 0) {
        const lastCheckpoint = this.completedCheckpoints[this.completedCheckpoints.length - 1];
        if (rawProgreso - 6 > lastCheckpoint || rawProgreso < lastCheckpoint) {
          progreso = lastCheckpoint;
        }
      }
    }
  
    return progreso;
  }

  guardarProgreso() {
    let progreso = this.saveProgreso();
    const uv = {
      id: this.usuarioVideo.id,
      idUsuario: this.usuarioVideo.idUsuario, 
      idVideo: this.usuarioVideo.idVideo, 
      progreso: progreso, 
      fechaEmpezado: this.usuarioVideo.fechaEmpezado ? this.formatoFecha(this.usuarioVideo.fechaEmpezado) : this.getCurrentDateInUTC6(), 
      fechaCompletado: this.usuarioVideo.fechaCompletado ? this.formatoFecha(this.usuarioVideo.fechaCompletado) : progreso > 99 ? this.getCurrentDateInUTC6() : null
    }
    
    this.gService.put(`usuarioVideo`, uv)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
      }
    });
  }
  
  guardarProgresoPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      let progreso = this.saveProgreso();
      const uv = {
        id: this.usuarioVideo.id,
        idUsuario: this.usuarioVideo.idUsuario, 
        idVideo: this.usuarioVideo.idVideo, 
        progreso: progreso, 
        fechaEmpezado: this.usuarioVideo.fechaEmpezado ? this.formatoFecha(this.usuarioVideo.fechaEmpezado) : this.getCurrentDateInUTC6(), 
        fechaCompletado: this.usuarioVideo.fechaCompletado ? this.formatoFecha(this.usuarioVideo.fechaCompletado) : progreso > 99 ? this.getCurrentDateInUTC6() : null
      }
      
      this.gService.put(`usuarioVideo`, uv)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            resolve(res);  // Resolve the promise when the request is successful
          },
          error: (err) => {
            reject(err);   // Reject the promise if there's an error
          }
        });
    });
  }

  getCurrentDateInUTC6(): string {
    const currentDate = new Date();
    const timeZone = 'America/Guatemala';
    
    const zonedDate = toZonedTime(currentDate, timeZone);
    const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone });
    
    return formattedDate;
  }

  formatoFecha(fecha: any): string {
    let date: string;
    
    date = fecha.slice(0, 19).replace('T', ' ');
    
    return date;
  }
}
