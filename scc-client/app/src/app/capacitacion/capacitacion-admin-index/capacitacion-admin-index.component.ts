import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
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
import { CapacitacionAdminModuloFormDialogComponent } from '../capacitacion-admin-modulo-form-dialog/capacitacion-admin-modulo-form-dialog.component';
import { CapacitacionAdminVideoFormDialogComponent } from '../capacitacion-admin-video-form-dialog/capacitacion-admin-video-form-dialog.component';
import { ConvertLineBreaksService } from '../../services/convert-line-breaks.service';

export interface videoInterface {
  id: any;
  titulo: string;
  descripcion: string;
  link: string;
  fechalimite: string;
  requerido: string;
  estado: string;
}

export interface usuarioInterface {
  id: string;
  usuarioId: string;
  usuarioIdentificacion: string;
  usuarioNombre: string;
  usuarioCorreo: string;
  usuarioPuesto: string;
}

@Component({
  selector: 'app-capacitacion-admin-index',
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
    FormsModule, 
    MatGridListModule, 
    MatCheckboxModule],
  templateUrl: './capacitacion-admin-index.component.html',
  styleUrl: './capacitacion-admin-index.component.scss'
})
export class CapacitacionAdminIndexComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;
  
  displayedColumnsNo: string[] = ['select', 'usuarioIdentificacion', 'usuarioNombre', 'usuarioPuesto'];
  dataUsuarioNo = new Array();
  dataSourceNo: MatTableDataSource<usuarioInterface>;
  
  displayedColumnsSi: string[] = ['select', 'usuarioIdentificacion', 'usuarioNombre', 'usuarioPuesto'];
  dataUsuarioSi = new Array();
  dataSourceSi: MatTableDataSource<usuarioInterface>;

  selectionNo = new SelectionModel<usuarioInterface>(true, []);
  selectionSi = new SelectionModel<usuarioInterface>(true, []);

  @ViewChild('moduloSelect') moduloSelect: MatSelect;
  @ViewChild('moduloInput') moduloInput: ElementRef;

  filtroModulos: any;

  modulos: any;
  videos: any;
  moduloVideos: any;

  selectedModulo: any;

  filtro: any;
  isOpenned: any;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private notificacion: NotificacionService,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    private httpClient:HttpClient,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public convertService: ConvertLineBreaksService
  ){

  }

  ngOnInit(): void {
    this.getModulos()
  }

  ngAfterViewInit(){
    this.moduloInput.nativeElement.style.width = '120px'
  }

  updateInputWidth(): void {
    if (!this.filtro) {
      this.moduloInput.nativeElement.style.width = '120px';
    } else {
      const inputValue  = this.moduloInput.nativeElement.value;
      const fontSize = window.getComputedStyle(this.moduloInput.nativeElement).fontSize; // Get computed font size

      // Create a temporary span to measure text width
      const tempSpan = document.createElement('span');
      tempSpan.style.fontSize = fontSize;
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'pre'; // Preserve spaces and line breaks
      tempSpan.textContent = inputValue;

      document.body.appendChild(tempSpan);

      // Get the computed width of the text content
      const textWidth = tempSpan.offsetWidth;

      // Clean up: remove the temporary span
      document.body.removeChild(tempSpan);

      this.moduloInput.nativeElement.style.width = `${textWidth}px`;
    }
  }

  cambiarLabel(isOpenned: any) {
    if (isOpenned) {
      this.moduloInput.nativeElement.focus();
    }
    this.isOpenned = isOpenned || this.filtro ? true : false;
  }

  fixNoMatch() {
    if (this.filtroModulos && this.filtroModulos.length == 0) {
      this.moduloInput.nativeElement.value = '';
      this.filtro = '';
      this.filtroModulos = this.modulos;
      this.moduloInput.nativeElement.focus();
    }
  }

  getModulos(selectId?: number) {
    this.gService.get(`modulo`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        if (res) {
          this.modulos = res.data;
          this.filtroModulos = this.modulos;

          if (selectId) {
            this.selectedModulo = this.modulos.find(m => m.id == selectId)
            this.getModuloThings();
          } else {
            this.selectedModulo = this.filtroModulos[0];
            this.getModuloThings();
          }
        }
      }
    });
  }

  getModuloThings() {
    console.log(this.selectedModulo)
    this.getModuloVideosByIdModulo();
    this.getUsuariosByModulo();
  }

  buscarModulo(event: any) {
    this.filtro = (event.target as HTMLInputElement).value;
    this.filtroModulos = this.modulos.filter(modulo => modulo.titulo.trim().toLowerCase().includes(this.filtro.trim().toLowerCase()));
    if (this.moduloSelect) {
      this.moduloSelect.open();
    }
    this.updateInputWidth();
  }

  openModuloFormDialog(crear: any): void {
    let width = '600px';
    let data = { 
      idModulo: this.selectedModulo ? this.selectedModulo.id : null,
      crear: crear,
    };
    
    const dialogRef = this.dialog.open(CapacitacionAdminModuloFormDialogComponent, {
      data,
      width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!result.id) {
          this.crearModulo(result);
        } else {
          this.actualizarModulo(result);
        }
      }
    });
  }
  
  crearModulo(modulo: any) {
    this.gService.post(`modulo`, modulo)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.selectedModulo = null;
        this.moduloVideos = null;
        this.getModulos(res.data.insertId);
        this.notificacion.mensaje('Modulo', 'Modulo creado correctamente', TipoMessage.success);
      }
    });
  }

  actualizarModulo(modulo: any) {
    this.gService.put(`modulo`, modulo)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.selectedModulo = null;
        this.moduloVideos = null;
        this.getModulos(modulo.id);
        this.notificacion.mensaje('Modulo', 'Modulo actualizado correctamente', TipoMessage.success);
      }
    });
  }

  borrarModulo() {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        this.gService.put(`modulo/borrar`, this.selectedModulo)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.selectedModulo = null;
            this.moduloVideos = null;
            this.getModulos();
            this.notificacion.mensaje('Modulo', 'Modulo eliminado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }

  




  getModuloVideosByIdModulo() {
    this.gService.get(`moduloVideo/moduloGroup/${this.selectedModulo.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.moduloVideos = res.data;
        
        this.moduloVideos.forEach(modulo => {
          modulo.moduloVideos.forEach(video => {
            video.videoThumbnail = this.getThumbnailUrl(video.videoLink)
          });
        });
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

  openVideoFormDialog(crear: any, idVideo?: any): void {
    let width = '1200px';
    let data = { 
      idVideo: idVideo,
      idModulo: this.selectedModulo.id,
      crear: crear,
    };
    
    const dialogRef = this.dialog.open(CapacitacionAdminVideoFormDialogComponent, {
      data,
      width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!result.id) {
          this.crearVideo(result);
        } else {
          this.actualizarVideo(result);
        }
      }
    });
  }
  
  crearVideo(video: any) {
    this.gService.post(`video`, video)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        const mv = {
          idModulo: this.selectedModulo.id,
          idVideo: res.data.insertId,
          nivel: video.nivel
        }

        this.gService.post(`moduloVideo`, mv)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.getModuloVideosByIdModulo();
            this.notificacion.mensaje('Video', 'Video creado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }

  actualizarVideo(video: any) {
    this.gService.put(`video`, video)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        const mv = {
          idModulo: this.selectedModulo.id,
          idVideo: video.id,
          nivel: video.nivel
        }

        this.gService.put2(`moduloVideo/${mv.idModulo}/${mv.idVideo}`, mv)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.getModuloVideosByIdModulo();
            this.notificacion.mensaje('Video', 'Video actualizado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }

  borrarVideo(video: any) {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        this.gService.put2(`moduloVideo/borrar/${this.selectedModulo.id}/${video.videoId}`, video)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next:(res) => {
            this.getModuloVideosByIdModulo();
            this.notificacion.mensaje('Video', 'Video eliminado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }



  getUsuariosByModulo() {
    this.gService.get(`usuario/noModulo/${this.selectedModulo.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSourceNo = new MatTableDataSource(res.data);
        this.selectionNo.clear();
        this.selectionSi.clear();
      }
    });

    this.gService.get(`usuarioModulo/modulo/${this.selectedModulo.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSourceSi = new MatTableDataSource(res.data);
      }
    });
  }

  applyFilterNo(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceNo.filter = filterValue.trim().toLowerCase();
  }

  applyFilterSi(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSi.filter = filterValue.trim().toLowerCase();
  }

  isAllSelectedNo() {
    const numSelected = this.selectionNo.selected.length;
    const numRows = this.dataSourceNo.filteredData.length;
    return numSelected === numRows;
  }
  toggleAllRowsNo() {
    if (this.isAllSelectedNo()) {
      this.selectionNo.clear();
      return;
    }

    this.selectionNo.select(...this.dataSourceNo.filteredData);
  }

  isAllSelectedSi() {
    const numSelected = this.selectionSi.selected.length;
    const numRows = this.dataSourceSi.filteredData.length;
    return numSelected === numRows;
  }
  toggleAllRowsSi() {
    if (this.isAllSelectedSi()) {
      this.selectionSi.clear();
      return;
    }

    this.selectionSi.select(...this.dataSourceSi.filteredData);
  }

  asignarUsuarios() {
    if (this.selectionNo.selected.length === 0) {
      return;
    }

    const datos = {
      idModulo: this.selectedModulo.id,
      datos: this.selectionNo.selected
    }

    this.gService.post(`usuarioModulo/multiple`, datos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Modulo', `Usuarios asignados al módulo '${this.selectedModulo.titulo}' correctamente`, TipoMessage.success);
        this.getUsuariosByModulo();
      }
    });
  }

  desasignarUsuarios() {
    const idUsuarios = this.selectionSi.selected.map(um => um.id);

    if (idUsuarios.length === 0) {
      return;
    }
    
    this.gService.post(`usuarioModulo/borrar/multiple`, idUsuarios)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificacion.mensaje('Modulo', `Usuarios desasignados del módulo '${this.selectedModulo.titulo}' correctamente`, TipoMessage.success);
        this.getUsuariosByModulo();
      }
    });
  }
}
