import { ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { AlertaService, TipoMessage } from '../../services/alerta.service';
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
import { MatDividerModule } from '@angular/material/divider';
import { resolve } from 'node:path';

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

export interface quizInterface {
  id?: number;
  idModulo: number;
  indexQuiz?: number,
  titulo: string;
  descripcion: string;
  preguntas: preguntaInterface[];
}

export interface preguntaInterface {
  id?: number;
  idQuiz?: number;
  idTipoPregunta: number;
  indexQuiz?: number,
  indexPregunta?: number,
  descripcion: string;
  puntos: number;
  orden?: number;
  imagen?: any;
  respuestas: respuestaInterface[];
}

export interface respuestaInterface {
  id?: number;
  idQuiz?: number;
  idQuizPregunta?: number;
  indexQuiz?: number,
  indexPregunta?: number,
  indexRespuesta?: number,
  descripcion: string;
  correcta: number;
  orden?: number;
  imagen?: any;
}

@Component({
  selector: 'app-capacitacion-admin-index',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ReactiveFormsModule,
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
    MatDividerModule, 
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


  quizes: quizInterface[] = [];
  tipoPreguntas: any[] = [];

  quizesBorrar: any[] = [];
  preguntasBorrar: any[] = [];
  respuestasBorrar: any[] = [];
  preguntasImagenBorrar: any[] = [];
  respuestasImagenBorrar: any[] = [];

  @ViewChildren('respuestaInput') respuestaInputs!: QueryList<ElementRef>;
  
  quizForm: FormGroup
  
  loadingV: boolean = true;
  loadingQ: boolean = true;
  loadingU: boolean = true;

  constructor(private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private router:Router,
    private route:ActivatedRoute,
    private activeRouter: ActivatedRoute,
    private httpClient:HttpClient,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public convertService: ConvertLineBreaksService,
    private cdr: ChangeDetectorRef
  ){

  }

  ngOnInit(): void {
    this.getModulos()
    this.reactiveQuizForm()
  }

  ngAfterViewInit(){
    this.moduloInput.nativeElement.style.width = '120px'
  }

  //Cosas del modulo, como elegir crear acutalizar etc
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
    this.loadingV = true;
    this.loadingQ = true;
    this.loadingU = true;
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
    this.loadingV = true;
    this.loadingQ = true;
    this.loadingU = true;
    if (this.selectedModulo) {
      this.getModuloVideosByIdModulo();
      this.getUsuariosByModulo();
      this.getQuizModulo();
    }
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
        this.alerta.mensaje('Modulo', 'Modulo creado correctamente', TipoMessage.success);
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
        this.alerta.mensaje('Modulo', 'Modulo actualizado correctamente', TipoMessage.success);
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
            this.alerta.mensaje('Modulo', 'Modulo eliminado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }

  




  //Cosas de los videos del modulo
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
        this.loadingV = false;
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
            this.alerta.mensaje('Video', 'Video creado correctamente', TipoMessage.success);
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
            this.alerta.mensaje('Video', 'Video actualizado correctamente', TipoMessage.success);
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
            this.alerta.mensaje('Video', 'Video eliminado correctamente', TipoMessage.success);
          }
        });
      }
    });
  }



  

  //Cosas de asignar usuario al modulo
  getUsuariosByModulo() {
    this.gService.get(`usuario/noModulo/${this.selectedModulo.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.dataSourceNo = new MatTableDataSource(res.data);
        this.selectionNo.clear();
        this.selectionSi.clear();

        this.loadingU = false;
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
        this.alerta.mensaje('Modulo', `Usuarios asignados al módulo '${this.selectedModulo.titulo}' correctamente`, TipoMessage.success);
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
        this.alerta.mensaje('Modulo', `Usuarios desasignados del módulo '${this.selectedModulo.titulo}' correctamente`, TipoMessage.success);
        this.getUsuariosByModulo();
      }
    });
  }





  //Cosas del quiz del modulo
  getQuizModulo() {
    this.gService.get(`quiz/modulo/${this.selectedModulo.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.quizes = res.data;
        this.quizes.forEach(quiz =>{
          if (quiz.preguntas) {
            quiz.preguntas.sort((a: preguntaInterface, b: preguntaInterface) => {
              if (a.orden === undefined) return 1;
              if (b.orden === undefined) return -1;
              return a.orden - b.orden;
            });
            quiz.preguntas.forEach(pregunta => {
              if (pregunta.respuestas) {
                pregunta.respuestas.sort((a: respuestaInterface, b: respuestaInterface) => {
                  if (a.orden === undefined) return 1;
                  if (b.orden === undefined) return -1;
                  return a.orden - b.orden;
                });
              }
            });
          }
        });
        this.loadingQ = false;

        this.reactiveQuizForm();
        if (this.quizes && this.quizes.length > 0) {
          this.cargarQuizDatos();
        }
        this.getTipoPreguntas();
      }
    });
  }

  getTipoPreguntas() {
    this.gService.get(`tipoPregunta`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.tipoPreguntas = res.data;
      }
    });
  }

  cargarQuizDatos() {
    this.reactiveQuizForm();
    this.quizesBorrar = [];
    this.preguntasBorrar = [];
    this.respuestasBorrar = [];
    this.preguntasImagenBorrar = [];
    this.respuestasImagenBorrar = [];

    const quizFormArray = this.quizForm.get('quizzes') as FormArray;
    
    this.quizes.forEach(quiz => {
      const quizGroup = this.fb.group({
        id: [quiz.id],
        idModulo: [quiz.idModulo],
        titulo: [quiz.titulo],
        descripcion: [quiz.descripcion],
        preguntas: this.fb.array([])
      });
  
      if (quiz.preguntas) {
        const preguntasFormArray = quizGroup.get('preguntas') as FormArray;
  
        quiz.preguntas.forEach(pregunta => {
          const preguntaGroup = this.fb.group({
            id: [pregunta.id],
            idQuiz: [pregunta.idQuiz],
            idTipoPregunta: [pregunta.idTipoPregunta],
            descripcion: [pregunta.descripcion],
            puntos: [pregunta.puntos],
            orden: [pregunta.orden],
            imagen: [pregunta.imagen],
            imagenUrl: [pregunta.imagen],
            respuestas: this.fb.array([])
          });
          
          if (pregunta.respuestas) {
            const respuestasFormArray = preguntaGroup.get('respuestas') as FormArray;
      
            pregunta.respuestas.forEach(respuesta => {
              const respuestaGroup = this.fb.group({
                id: [respuesta.id],
                idQuizPregunta: [respuesta.idQuizPregunta],
                descripcion: [respuesta.descripcion],
                correcta: [respuesta.correcta],
                orden: [respuesta.orden],
                imagen: [respuesta.imagen],
                imagenUrl: [respuesta.imagen]
              });
      
              respuestasFormArray.push(respuestaGroup);
            });
          }
          preguntasFormArray.push(preguntaGroup);
        });
      }
  
      quizFormArray.push(quizGroup);
    });
  }
  
  reactiveQuizForm() {
    this.quizForm = this.fb.group({
      quizzes: this.fb.array([])
    });
  }


  quizzes(): FormArray {
    return this.quizForm.get('quizzes') as FormArray;
  }

  getQuiz(quizIndex: number): quizInterface {
    return this.quizzes().at(quizIndex).value;
  }

  crearQuiz() {
    return this.fb.group({
      id: [null],
      idModulo: [this.selectedModulo.id],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(3000)]],
      preguntas: this.fb.array([this.crearPregunta()])
    });
  }

  agregarQuiz() {
    this.quizzes().push(this.crearQuiz());
  }

  removerQuiz(quizIndex: number): void {
    const quiz = this.getQuiz(quizIndex);
    if (quiz.id) {
      this.quizesBorrar.push(quiz.id);
    }
    this.quizzes().removeAt(quizIndex);
  }

  preguntas(quizIndex: number): FormArray {
    return this.quizzes().at(quizIndex).get('preguntas') as FormArray;
  }

  getPregunta(quizIndex: number, preguntaIndex: number): preguntaInterface {
    return this.preguntas(quizIndex).at(preguntaIndex).value;
  }

  crearPregunta(idQuiz: any = null): FormGroup {
    return this.fb.group({
      id: [null],
      idQuiz: [idQuiz],
      idTipoPregunta: [1, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      puntos: [1],
      imagen: [null],
      imagenUrl: [null],
      respuestas: this.fb.array([this.crearRespuesta()])
    });
  }

  agregarPregunta(quizIndex: number): void {
    this.preguntas(quizIndex).push(this.crearPregunta(this.getQuiz(quizIndex).id));
  }

  removerPregunta(quizIndex: number, preguntaIndex: number): void {
    const pregunta = this.getPregunta(quizIndex, preguntaIndex);
    if (pregunta.id) {
      this.preguntasBorrar.push({
        id: pregunta.id,
        idQuiz: pregunta.idQuiz,
      });
    }
    this.preguntas(quizIndex).removeAt(preguntaIndex);
  }



  respuestas(quizIndex: number, preguntaIndex: number): FormArray {
    return this.preguntas(quizIndex).at(preguntaIndex).get('respuestas') as FormArray;
  }

  getRespuesta(quizIndex: number, preguntaIndex: number, respuestaIndex: number): respuestaInterface {
    return this.respuestas(quizIndex, preguntaIndex).at(respuestaIndex).value;
  }

  crearRespuesta(idQuizPregunta: any = null): FormGroup {
    return this.fb.group({
      id: [null],
      idQuizPregunta: [idQuizPregunta],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      correcta: [0],
      imagen: [null],
      imagenUrl: [null]
    });
  }

  agregarRespuesta(quizIndex: number, preguntaIndex: number): void {
    this.respuestas(quizIndex, preguntaIndex).push(this.crearRespuesta(this.getPregunta(quizIndex, preguntaIndex).id));
  }

  removerRespuesta(quizIndex: number, preguntaIndex: number, respuestasIndex: number): void {
    const quiz = this.getQuiz(quizIndex);
    const respuesta = this.getRespuesta(quizIndex, preguntaIndex, respuestasIndex);
    if (respuesta.id && quiz.id) {
      this.respuestasBorrar.push({
        id: respuesta.id,
        idQuiz: quiz.id,
        idQuizPregunta: respuesta.idQuizPregunta
      });
    }
    this.respuestas(quizIndex, preguntaIndex).removeAt(respuestasIndex);
  }


  onTipoPreguntaChange(pregunta: any) {
    const idTipoPregunta = pregunta.get('idTipoPregunta')?.value;
    const puntos = pregunta.get('puntos');

    if (idTipoPregunta == 3 && puntos) {
      puntos.disable();
    }
  }
  
  seleccionarArchivo(event: any, pregunta: any) {
    const archivo = event.target.files[0];
    
    if (archivo) {
      const maxSizeInBytes = 50 * 1024 * 1024; // Tamaño máximo de 50 MB
  
      if (archivo.size > maxSizeInBytes) {
        pregunta.get('imagen').setErrors({'size': true});
      } else {
        pregunta.get('imagen').setErrors(null);
  
        pregunta.patchValue({ imagen: archivo });

        const reader = new FileReader();
        reader.onload = () => {
          pregunta.patchValue({ imagenUrl: reader.result });
        };
        reader.readAsDataURL(archivo);
      }
    }
  }
  
  seleccionarArchivoRespuesta(event: any, respuesta: any) {
    const archivo = event.target.files[0];
    
    if (archivo) {
      const maxSizeInBytes = 50 * 1024 * 1024; // Tamaño máximo de 50 MB
  
      if (archivo.size > maxSizeInBytes) {
        respuesta.get('imagen').setErrors({'size': true});
      } else {
        respuesta.get('imagen').setErrors(null);
  
        respuesta.patchValue({ imagen: archivo });

        const reader = new FileReader();
        reader.onload = () => {
          respuesta.patchValue({ imagenUrl: reader.result });
        };
        reader.readAsDataURL(archivo);
      }
    }
  }

  removerPreguntaImagen(pregunta: any): void {
    if (pregunta.get('id').value) {
      this.preguntasImagenBorrar.push({
        id: pregunta.get('id').value,
        idQuiz: pregunta.get('idQuiz').value
      });
    }
    pregunta.get('imagen').setValue(null);
    pregunta.get('imagenUrl').setValue(null); 
  }

  removerRespuestaImagen(respuesta: any, quizIndex: number): void {
    const quiz = this.getQuiz(quizIndex);
    if (respuesta.get('id').value && quiz.id) {
      this.respuestasImagenBorrar.push({
        id: respuesta.get('id').value,
        idQuiz: quiz.id,
        idQuizPregunta: respuesta.get('idQuizPregunta').value
      });
    }
    respuesta.get('imagen').setValue(null);
    respuesta.get('imagenUrl').setValue(null); 
  }
  marcarCorrecta(respuesta: any) {
    const correcta = respuesta.get('correcta');
    if (respuesta && correcta) {
      correcta.setValue(correcta.value == 0 ? 1 : 0);
    }
  }

  onEnterPressRespuesta(event: KeyboardEvent, quizIndex: number, preguntaIndex: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      this.respuestas(quizIndex, preguntaIndex).push(this.crearRespuesta(this.getPregunta(quizIndex, preguntaIndex).id));
      

      this.cdr.detectChanges();

      setTimeout(() => {
        const currentIndex = parseInt((event.target as HTMLElement).getAttribute('data-index') || '0', 10);
        
        const index = `${quizIndex}${preguntaIndex}${this.respuestas(quizIndex, preguntaIndex).length - 1}`
        const nextInput = this.respuestaInputs.find(input => 
          parseInt(input.nativeElement.getAttribute('data-index') || '0', 10) === parseInt(index)
        );

        if (nextInput) {
          nextInput.nativeElement.focus();
        } else {
          console.log('Next input not found');
        }
      });
    }
  }




  confirmarGuardar() {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        this.guardarQuizes();
      }
    });
  }

  guardarQuizes() {
    const allQuizes = this.quizForm.value.quizzes;
    let preQuizes = [];
    let prePreguntas = [];
    let preRespuestas = [];
    let imagenes = {preguntas: [], respuestas: []};

    allQuizes.forEach((quiz, quizIndex) => {
      quiz.indexQuiz = quizIndex;

      if (quiz.preguntas) {
        quiz.preguntas.forEach((pregunta, preguntaIndex) => {
          pregunta.indexQuiz = quizIndex;
          pregunta.indexPregunta = preguntaIndex;
          if (pregunta.imagen && pregunta.imagen instanceof File) {
            imagenes.preguntas.push({ 
              indexQuiz: quizIndex,
              indexPregunta: preguntaIndex,
              imagen: pregunta.imagen 
            });
          }
          
          if (pregunta.respuestas) {
            pregunta.respuestas.forEach((respuesta, respuestaIndex) => {
              respuesta.indexQuiz = quizIndex;
              respuesta.indexPregunta = preguntaIndex;
              respuesta.indexRespuesta = respuestaIndex;
              if (respuesta.imagen && respuesta.imagen instanceof File) {
                imagenes.respuestas.push({ 
                  indexQuiz: quizIndex,
                  indexPregunta: preguntaIndex,
                  indexRespuesta: respuestaIndex,
                  imagen: respuesta.imagen 
                });
              }
              preRespuestas.push(respuesta);
            });
          }
          delete pregunta.respuestas;
          prePreguntas.push(pregunta);
        });
      }
      delete quiz.preguntas;
      preQuizes.push(quiz);
    });

    const superQuiz = {
      quizes: preQuizes,
      preguntas: prePreguntas,
      respuestas: preRespuestas,
      imagenes: imagenes
    };
    const borrarPreguntasImagenPromise = this.preguntasImagenBorrar.length > 0 ? this.borrarPreguntasImagen() : Promise.resolve();
    const borrarRespuestasImagenPromise = this.respuestasImagenBorrar.length > 0 ? this.borrarRespuestasImagen() : Promise.resolve();
    Promise.all([borrarPreguntasImagenPromise, borrarRespuestasImagenPromise])
    .then(() => {
      const quizBorrarPromise = this.quizesBorrar.length > 0 ? this.borrarQuizes() : Promise.resolve();
      const preguntaBorrarPromise = this.preguntasBorrar.length > 0 ? this.borrarPreguntas() : Promise.resolve();
      const respuestaBorrarPromise = this.respuestasBorrar.length > 0 ? this.borrarRespuestas()  : Promise.resolve();
      Promise.all([quizBorrarPromise, preguntaBorrarPromise, respuestaBorrarPromise])
      .then(() => {
        Promise.all([this.saveQuizes(superQuiz)])
        .then(() => {
          const preguntaImagenesPromise = superQuiz.imagenes.preguntas && superQuiz.imagenes.preguntas.length > 0 ? this.savePreguntaImagenes(superQuiz.imagenes.preguntas) : Promise.resolve();
          const respuestaImagenesPromise = superQuiz.imagenes.respuestas && superQuiz.imagenes.respuestas.length > 0 ? this.saveRespuestaImagenes(superQuiz.imagenes.respuestas) : Promise.resolve();
          Promise.all([preguntaImagenesPromise, respuestaImagenesPromise])
          .then(() => {
            this.getQuizModulo();
            this.alerta.mensaje('Quiz', 'Cambios guardados correctamente', TipoMessage.success);
          })
          .catch(error => {
            this.getQuizModulo();
            console.error("Error al crear o actualizar imagenes:", error);
            this.alerta.mensaje('Quiz', 'Error al crear o actualizar imagenes', TipoMessage.error);
          });
        })
        .catch(error => {
          this.getQuizModulo();
          console.error("Error al crear o actualizar quizes:", error);
          this.alerta.mensaje('Quiz', 'Error al crear o actualizar quizes', TipoMessage.error);
        });
      })
      .catch(error => {
        this.getQuizModulo();
        console.error("Error al borrar quizes:", error);
        this.alerta.mensaje('Quiz', 'Error al borrar quizes', TipoMessage.error);
      });
    })
    .catch(error => {
      this.getQuizModulo();
      console.error("Error al crear imagenes:", error);
      this.alerta.mensaje('Quiz', 'Error al borrar imagenes', TipoMessage.error);
    });
  }

  saveQuizes(superQuiz: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quiz/save/multiples`, superQuiz.quizes)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          if (superQuiz.preguntas) {
            for (let qIds of res.quizzesIds) {
              this.updateIds(superQuiz.preguntas, qIds, 'quiz');
              this.updateIds(superQuiz.respuestas, qIds, 'quiz');
              this.updateIds(superQuiz.imagenes.preguntas, qIds, 'quiz');
              this.updateIds(superQuiz.imagenes.respuestas, qIds, 'quiz');
            }

            Promise.all([this.savePreguntas(superQuiz)])
            .then(() => {
              resolve(res);
            })
            .catch(error => {
              console.error("Error al crear archivos or respuestas:", error);
              this.alerta.mensaje('Foro', 'Error al crear archivos o respuestas', TipoMessage.error);
            });
          }
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  savePreguntas(superQuiz: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizPregunta/save/multiples`, superQuiz.preguntas)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          for (let pIds of res.preguntasIds) {
            this.updateIds(superQuiz.preguntas, pIds, 'pregunta');
            this.updateIds(superQuiz.respuestas, pIds, 'pregunta', true);
            this.updateIds(superQuiz.imagenes.preguntas, pIds, 'pregunta');
            this.updateIds(superQuiz.imagenes.respuestas, pIds, 'pregunta');
          }

          if (superQuiz.respuestas) {
            Promise.all([this.saveRespuestas(superQuiz)])
            .then(() => {
              resolve(res);
            })
            .catch(error => {
              console.error("Error al crear archivos or respuestas:", error);
              this.alerta.mensaje('Foro', 'Error al crear archivos o respuestas', TipoMessage.error);
            });
          } else {
            resolve(res);
          }
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  saveRespuestas(superQuiz: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizRespuesta/save/multiples`, superQuiz.respuestas)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          for (let rIds of res.respuestasIds) {
            this.updateIds(superQuiz.respuestas, rIds, 'respuesta');
            this.updateIds(superQuiz.imagenes.respuestas, rIds, 'respuesta');
          }
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  updateIds(items, ids, idType, noId?)  {
    items.forEach(item => {
      if (item.indexQuiz === ids.indexQuiz &&
          (idType === 'quiz' || item.indexPregunta === ids.indexPregunta) &&
          (idType === 'quiz' || idType === 'pregunta' || item.indexRespuesta === ids.indexRespuesta)) {
        switch (idType) {
          case 'quiz':
            item.idQuiz = ids.id;
            break;
          case 'pregunta':
            if (!noId) {
              item.id = ids.id;
            }
            item.idQuizPregunta = ids.id;
            break;
          case 'respuesta':
            item.id = ids.id;
            item.idQuizRespuesta = ids.id;
            break;
        }
      }
    });
  };

  savePreguntaImagenes(preguntas: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      for (let imagen of preguntas) {
        formData.append('id', imagen.idQuizPregunta.toString());
        formData.append('idQuiz', imagen.idQuiz.toString());
        formData.append('imagen', imagen.imagen);
      }
      this.gService.post(`quizPregunta/imagenes`, formData)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  saveRespuestaImagenes(respuestas: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      for (let imagen of respuestas) {
        formData.append('id', imagen.idQuizRespuesta.toString());
        formData.append('idQuiz', imagen.idQuiz.toString());
        formData.append('idQuizPregunta', imagen.idQuizPregunta.toString());
        formData.append('imagen', imagen.imagen);
      }
      this.gService.post(`quizRespuesta/imagenes`, formData)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  borrarQuizes(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quiz/borrar/multiples`, this.quizesBorrar)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  borrarPreguntas(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizPregunta/borrar/multiples`, this.preguntasBorrar)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  borrarRespuestas(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizRespuesta/borrar/multiples`, this.respuestasBorrar)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  borrarPreguntasImagen(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizPregunta/borrar/imagenes`, this.preguntasImagenBorrar)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  borrarRespuestasImagen(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gService.post(`quizRespuesta/borrar/imagenes`, this.respuestasImagenBorrar)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next:(res) => {
          resolve(res);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  cancelarQuiz() {
    this.confirmationService.confirm()
    .subscribe(result => {
      if (result) {
        this.getQuizModulo();
      }
    });
  }
}
