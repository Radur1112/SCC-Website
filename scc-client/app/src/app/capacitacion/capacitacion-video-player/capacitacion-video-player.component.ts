import { Component, OnInit, Input, OnDestroy, AfterViewInit, SimpleChanges } from '@angular/core';
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
  player: YT.Player;
  videoId: string;
  checkInterval: any;

  initialProgress: number = 0;
  videoDuration: any;

  previousTime: any;
  previousPercentage: any = 0;
  penalization: any = 0;
  watchedTime: any = 0;
  checkpoints: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  completedCheckpoints: number[] = [];

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

    this.saveProgreso();
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
    let startTimeInSeconds = this.initialProgress * this.videoDuration / 100;
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
    const interval = currentTime - this.previousTime;

    if ( Math.abs(interval) > 1.25) {
      if (currentTime > this.previousTime) {
        this.penalization += Math.abs(interval) - 1;
      } else {
        this.penalization -= Math.abs(interval) + 1;
      }
    }
    if (interval) {
      this.watchedTime += interval;

      if (this.watchedTime < 0) {
        this.watchedTime = 0;
      }
    }

    for (let checkpoint of this.checkpoints) {
      if (!this.completedCheckpoints.includes(checkpoint) && this.previousPercentage <= checkpoint && currentPercentage >= checkpoint) {
        let allPrecedingCompleted = true;

        for (let preceding of this.checkpoints.slice(0, this.checkpoints.indexOf(checkpoint))) {
          if (!this.completedCheckpoints.includes(preceding)) {
            allPrecedingCompleted = false;
            break;
          }
        }

        if (allPrecedingCompleted) {
          this.completedCheckpoints.push(checkpoint);
          break;
        }
      }
    };

    this.previousPercentage = currentPercentage;
    this.previousTime = currentTime;
  }

  private stopTracking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  saveProgreso() {
    if (!this.usuarioVideo.fechaCompletado && this.usuarioVideo.progreso < 100 && this.watchedTime > 0) {
      let preProgreso = ((this.watchedTime - this.penalization) * 100 / this.player.getDuration()) + this.initialProgress;
      let progreso: number;

      for (let checkpoint of this.completedCheckpoints) {
        if (preProgreso > checkpoint) {
          continue;
        } else {
          progreso = preProgreso;
          break;
        }
      };

      if (progreso === undefined) {
        progreso = preProgreso > 95 ? 100 : preProgreso;
        if (this.completedCheckpoints.length > 0 && progreso - 10 > this.completedCheckpoints[this.completedCheckpoints.length - 1]) {
          progreso = this.completedCheckpoints[this.completedCheckpoints.length - 1];
        }
      }
  

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
