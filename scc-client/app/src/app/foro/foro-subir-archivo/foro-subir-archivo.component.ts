import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';

@Component({
  selector: 'app-foro-subir-archivo',
  standalone: true,
  imports: [CommonModule, FileUploadModule, MatButtonModule],
  templateUrl: './foro-subir-archivo.component.html',
  styleUrl: './foro-subir-archivo.component.scss'
})
export class ForoSubirArchivoComponent {
  @Output() archivosSelected = new EventEmitter<File[]>();

  public uploader: FileUploader = new FileUploader({
    url: '',
    isHTML5: true,
    queueLimit: 10, 
  });

  constructor() {
    this.uploader.onAfterAddingFile = (file) => { 
      file.withCredentials = false; 
      if (this.uploader.queue.length > 10) {
        this.uploader.removeFromQueue(file);
      } else {
        this.emitFiles();
      }
    };
  }

  removeFile(item: any) {
    item.remove();
    this.emitFiles();
  }

  removeFiles() {
    while (this.uploader.queue.length > 0) {
      this.uploader.removeFromQueue(this.uploader.queue[0]);
    }
    this.emitFiles();
  }

  emitFiles() {
    const archivos = this.uploader.queue.map(fileItem => fileItem._file);
    this.archivosSelected.emit(archivos);
  }
}
