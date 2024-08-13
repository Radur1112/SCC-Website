import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConvertLineBreaksService {

  constructor() { }
  
  convertLineBreaks(descripcion: string): string {
    return descripcion.replace(/\n/g, '<br>');
  }
}
