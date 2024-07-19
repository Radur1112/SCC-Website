import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../services/generic.service';
import { Observable, Subject, map, startWith, takeUntil } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-capacitacion-admin-video-form-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule, MatDialogModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule, MatChipsModule,],
  templateUrl: './capacitacion-admin-video-form-dialog.component.html',
  styleUrl: './capacitacion-admin-video-form-dialog.component.scss',
  providers: [DatePipe]
})
export class CapacitacionAdminVideoFormDialogComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  videoForm: FormGroup;
  tituloForm: any;

  crear: any;
  idVideo: any;
  idModulo: any;

  youtubePreviewUrl: SafeResourceUrl  | null = null;

  maxDate: Date;
  minDate: Date;

  textoRequerido: any = 'Si';

  niveles: any;
  filterNiveles: Observable<string[]>;
  
  constructor(
    private gService: GenericService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CapacitacionAdminVideoFormDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _adapter: DateAdapter<any>,
    private sanitizer: DomSanitizer
  ) {
    this._locale = 'cr';
    this._adapter.setLocale(this._locale);

    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    this.maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 10);

    
    this.crear = this.data.crear;
    this.idVideo = this.data.idVideo;
    this.idModulo = this.data.idModulo;

    this.formularioReactive();
  }

  ngOnInit(): void {
    if (this.crear) {
      this.tituloForm = 'Crear';
    } else {
      this.tituloForm = 'Actualizar';
      this.cargarDatos();
    }
    this.getNiveles();
  }

  cargarDatos() {
    this.gService.get(`video/${this.idVideo}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        const resVideo = res.data;

        this.gService.get(`moduloVideo/${this.idModulo}/${this.idVideo}`)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(resM) => {
            const mv = resM.data;
            this.videoForm.setValue({
              id: resVideo.id,
              titulo: resVideo.titulo,
              descripcion: resVideo.descripcion,
              link: resVideo.link,
              nivel: mv.nivel,
              fechaLimite: resVideo.fechaLimite,
              requerido: resVideo.requerido
            })
          }
        });
      }
    });
  }
  
  formularioReactive() {
    this.videoForm = this.fb.group({
      id: [null],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(3000)]],
      link: ['', [Validators.required, this.youtubeLinkValidator, Validators.maxLength(250)]],
      nivel: [0, Validators.maxLength(100)],
      fechaLimite: [null],
      requerido: [true]
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.videoForm.controls[control].hasError(error);
  };

  getNiveles() {
    this.gService.get(`moduloVideo/niveles/${this.idModulo}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.niveles = res.data;
        this.niveles = this.niveles.map(nivel => nivel.nivel)
        
        this.filterNiveles = this.videoForm.get('nivel').valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      }
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.niveles.filter(option => option.toLowerCase().includes(filterValue));
  }

  youtubeLinkValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(control.value)) {
      return { invalidYoutubeLink: true };
    }

    return null;
  }

  onYoutubeLinkChange() {
    const youtubeLink = this.videoForm.get('link').value;

    // Update preview if valid YouTube link
    if (this.videoForm.get('link').valid) {
      this.youtubePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getYoutubeEmbedUrl(youtubeLink));
    } else {
      this.youtubePreviewUrl = null;
    }
  }
  getYoutubeEmbedUrl(link: string): string | null {
    if (!link) {
      return null;
    }

    const videoId = this.extractVideoId(link);
    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }
  extractVideoId(link: string): string | null {
    const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(videoIdRegex);
    return match ? match[1] : null;
  }
  
  esRequerido(event: any) {
    const requerido = event.checked;

    if (requerido) {
      this.textoRequerido = 'Sí';
    } else {
      this.textoRequerido = 'No';
    }
  }

  returnModulo() {
    if (this.videoForm.invalid) {
      return; 
    }

    const fechaLimite = this.videoForm.get('fechaLimite');

    if (fechaLimite && fechaLimite.value) {
      this.videoForm.value.fechaLimite = this.formatearFecha(new Date(this.videoForm.value.fechaLimite));
    }

    this.dialogRef.close(this.videoForm.value);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}
