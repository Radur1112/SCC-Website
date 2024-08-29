import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../services/generic.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertaService, TipoMessage } from '../../services/alerta.service';
import { MatDialog } from '@angular/material/dialog';
import { ConvertLineBreaksService } from '../../services/convert-line-breaks.service';
import { AuthService } from '../../services/auth.service';
import { MatRadioModule } from '@angular/material/radio';
import { CapacitacionQuizRealizadoDialogComponent } from '../capacitacion-quiz-realizado-dialog/capacitacion-quiz-realizado-dialog.component';

@Component({
  selector: 'app-capacitacion-quiz',
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
    MatCheckboxModule,
    MatRadioModule],
  templateUrl: './capacitacion-quiz.component.html',
  styleUrl: './capacitacion-quiz.component.scss'
})
export class CapacitacionQuizComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  usuarioActual: any;

  quizForm: FormGroup

  usuarioQuiz: any;
  quizId: any;

  readOnly: boolean = false;
  respondidos: any[] = [];
  
  loading: boolean = true;

  constructor(private gService: GenericService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private alerta: AlertaService,
    private router :Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public convertService: ConvertLineBreaksService
  ){
    this.reactiveQuizForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('id');
      
      this.authService.usuarioActual.subscribe((x) => {
        if (x && Object.keys(x).length !== 0) {
          this.usuarioActual = x.usuario;

          if (this.quizId) {
            this.getQuiz();
          } else {
            this.quizId = params.get('idUsuarioQuiz');
            this.getUsuarioQuiz();
          }
        } else {
          this.usuarioActual = null;
        }
      });

    });
  }
  
  reactiveQuizForm() {
    this.quizForm = this.fb.group({
      preguntas: this.fb.array([])
    });
  }

  getQuiz() {
    this.loading = true;
    
    this.gService.get(`usuarioQuiz/all/${this.usuarioActual.id}/${this.quizId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data.nota) {
          this.readOnly = true;
        }
        this.usuarioQuiz = res.data;
        this.usuarioQuiz.preguntas.sort((a: any, b: any) => {
          if (a.orden === undefined) return 1;
          if (b.orden === undefined) return -1;
          return a.orden - b.orden;
        });
        this.usuarioQuiz.preguntas.forEach(pregunta => {
          pregunta.respuestas.sort((a: any, b: any) => {
            if (a.orden === undefined) return 1;
            if (b.orden === undefined) return -1;
            return a.orden - b.orden;
          });
        });
        
        this.loading = false;
        this.cargarDatos();
      }
    });
  }

  getUsuarioQuiz() {
    this.gService.get(`usuarioQuiz/${this.quizId}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.data.nota) {
          this.readOnly = true;
        }
        this.usuarioQuiz = res.data;
        this.usuarioQuiz.preguntas.sort((a: any, b: any) => {
          if (a.orden === undefined) return 1;
          if (b.orden === undefined) return -1;
          return a.orden - b.orden;
        });
        this.usuarioQuiz.preguntas.forEach(pregunta => {
          pregunta.respuestas.sort((a: any, b: any) => {
            if (a.orden === undefined) return 1;
            if (b.orden === undefined) return -1;
            return a.orden - b.orden;
          });
        });
        
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    this.reactiveQuizForm();

    if (this.usuarioQuiz.preguntas) {
      const preguntasFormArray = this.quizForm.get('preguntas') as FormArray;

      this.usuarioQuiz.preguntas.forEach(pregunta => {
        let descripcionRespuesta;
        if (pregunta.respondidas) {
          descripcionRespuesta = pregunta.respondidas.find(r => r.descripcion)?.descripcion;
        }
        const preguntaGroup = this.fb.group({
          id: [pregunta.id],
          idQuiz: [pregunta.idQuiz],
          idTipoPregunta: [pregunta.idTipoPregunta],
          descripcion: [pregunta.descripcion],
          puntos: [pregunta.puntos],
          imagen: [pregunta.imagen],
          imagenUrl: [pregunta.imagen],
          respuestas: this.fb.array([]),
          respondidas: [pregunta.respondidas],
          respuesta: [{ value: descripcionRespuesta ?? null, disabled: this.readOnly }]
        });
        
        const respuestasFormArray = preguntaGroup.get('respuestas') as FormArray;
        if (pregunta.respuestas) {
          pregunta.respuestas.forEach(respuesta => {
            const isRespondida = this.isRespondida(pregunta.respondidas, respuesta.id)

            const respuestaGroup = this.fb.group({
              id: [respuesta.id],
              idQuizPregunta: [respuesta.idQuizPregunta],
              descripcion: [respuesta.descripcion],
              correcta: [respuesta.correcta],
              imagen: [respuesta.imagen],
              imagenUrl: [respuesta.imagen],
              respuesta: [{ value: isRespondida, disabled: this.readOnly }],
              classCorrecta: this.readOnly && respuesta.correcta == 1,
              classIncorrecta: this.readOnly && respuesta.correcta != 1 && isRespondida
            });
    
            respuestasFormArray.push(respuestaGroup);
          });
        }
        preguntasFormArray.push(preguntaGroup);
      });
    }

    if (this.readOnly) {
      this.cargarRespuestas();
    }
  }

  cargarRespuestas() {
    
  }

  preguntas(): FormArray {
    return this.quizForm.get('preguntas') as FormArray;
  }

  getPregunta(preguntaIndex) {
    return this.preguntas().at(preguntaIndex);
  }

  respuestas(preguntaIndex: number): FormArray {
    return this.preguntas().at(preguntaIndex).get('respuestas') as FormArray;
  }

  onChangeRespuestaCheck(preguntaIndex: any) {
    const pregunta = this.getPregunta(preguntaIndex);
    const respondido = this.respuestas(preguntaIndex).controls
      .filter(respuesta => respuesta.get('respuesta')?.value)
      .map(respuesta => respuesta.get('id')?.value)
      .filter(id => id !== undefined);
  
    pregunta.get('respuesta')?.setValue(respondido);
  }

  getPreguntaPoints(pregunta: any): number {
    const respondidas = pregunta.get('respondidas')?.value;
    const idTipoPregunta = pregunta.get('idTipoPregunta')?.value;
    const puntos = pregunta.get('puntos')?.value || 0;

    if (!respondidas || !Array.isArray(respondidas)) {
      return 0;
    }

    const anyCorrectaRespondida = respondidas.filter(r => r.correcta == 1);
    const anyIncorrectaRespondida = respondidas.some(r => r.correcta == 0);

    if (idTipoPregunta && idTipoPregunta == 2) {
      const respuestasPregunta = this.usuarioQuiz.preguntas.find(p => p.id == pregunta.get('id')?.value).respuestas;

      if (!respuestasPregunta) {
        return 0;
      }

      const anyCorrectaRespuesta = respuestasPregunta.filter(rp => rp.correcta === 1);
      if (anyIncorrectaRespondida || anyCorrectaRespondida < anyCorrectaRespuesta) {
        return 0;
      }
      return puntos;
    }
    return anyIncorrectaRespondida ? 0 : puntos;
  }

  isRespondida(respondidas: any, idRespuesta: any) {
    if (respondidas) {
      if (respondidas.find(r => r.idQuizRespuesta == idRespuesta)) {
        return true;
      }
    }
    return false;
  }

  terminarQuiz() {
    const respondidos = [];
    const quiz = this.quizForm.value;

    if (quiz.preguntas) {
      quiz.preguntas.forEach((pregunta) => {
        if (pregunta.respuesta) {
          switch (pregunta.idTipoPregunta) {
            case 1: 
              respondidos.push({
                idUsuarioQuiz: this.usuarioQuiz.id,
                idQuizPregunta: pregunta.id,
                idQuizRespuesta: pregunta.respuesta
              });
              break;
            case 2:
              pregunta.respuesta.forEach((respuesta) => {
                respondidos.push({
                  idUsuarioQuiz: this.usuarioQuiz.id,
                  idQuizPregunta: pregunta.id,
                  idQuizRespuesta: respuesta
                });
              });
              break;
            case 3:
              respondidos.push({
                idUsuarioQuiz: this.usuarioQuiz.id,
                idQuizPregunta: pregunta.id,
                descripcion: pregunta.respuesta
              });
              break;
          }
        }
      });
    }

    if (respondidos.length < quiz.preguntas.length) {
      this.alerta.mensaje('Quiz', 'Debe completar todas la preguntas para terminar el quiz', TipoMessage.error);
      return;
    }

    this.guardarRespuestas(respondidos);
  }

  guardarRespuestas(respondidos: any[]) {
    this.gService.post(`usuarioQuizRespuesta/multiples`, respondidos)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.alerta.mensaje('Quiz', 'Quiz terminado correctamente', TipoMessage.success);
        this.router.navigate(['capacitacion']);
      }
    });
  }
}
