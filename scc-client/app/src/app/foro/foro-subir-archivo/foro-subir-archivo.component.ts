import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { NotificacionService, TipoMessage } from '../../services/notification.service';

interface ExistingFile {
  id: any;
  nombreArchivo: string;
  ubicacion: string;
}

@Component({
  selector: 'app-foro-subir-archivo',
  standalone: true,
  imports: [CommonModule, FileUploadModule, MatButtonModule],
  templateUrl: './foro-subir-archivo.component.html',
  styleUrl: './foro-subir-archivo.component.scss'
})
export class ForoSubirArchivoComponent {
  @Input() existingFiles: ExistingFile[] = [];
  @Output() borrarArchivosSelected = new EventEmitter<ExistingFile>();
  @Output() archivosSelected = new EventEmitter<File[]>();

  public uploader: FileUploader = new FileUploader({
    url: '',
    isHTML5: true,
    queueLimit: 10, 
  });

  constructor(private notificacion: NotificacionService) {
    this.uploader.onAfterAddingFile = (file) => { 
      console.log(file)
      file.withCredentials = false; 
      if (this.uploader.queue.length > 10) {
      } else {
        if (this.uploader.queue.filter(q => q._file.name == file._file.name).length > 1 || this.existingFiles.find(e => e.nombreArchivo == file._file.name)) {
          this.uploader.removeFromQueue(file);
          this.notificacion.mensaje('Archivos', 'Este archivo ya fue seleccionado', TipoMessage.warning);
        } else {
          this.emitFiles();
        }
      }
    };
  }

  removeFile(item: any) {
    item.remove();
    this.emitFiles();
  }

  removeExistingFile(fileId: string) {
    const borrarArchivo = this.existingFiles.find(f => f.id == fileId);
    this.existingFiles = this.existingFiles.filter(f => f.id != fileId);
    this.emitExistingFiles(borrarArchivo);
  }

  removeFiles() {
    while (this.uploader.queue.length > 0) {
      this.uploader.removeFromQueue(this.uploader.queue[0]);
    }
    this.emitFiles();
  }

  emitExistingFiles(borrarArchivo: ExistingFile) {
    this.borrarArchivosSelected.emit(borrarArchivo);
  }

  emitFiles() {
    const archivos = this.uploader.queue.map(fileItem => fileItem._file);
    this.archivosSelected.emit(archivos);
  }
}
