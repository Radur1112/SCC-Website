import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvinciasService {
  //Url base del api donde se ubican todos los distritos de Costa Rica
  private apiUrl = 'https://services.arcgis.com/LjCtRQt1uf8M6LGR/arcgis/rest/services/Distritos_CR/FeatureServer/0/query';

  constructor(private http: HttpClient) { }

  //Este método obtiene todas las provincias, espécifica que solo traiga 'NOM_PROV' (nombre) y 'COD_PROV' (codigo) porque son los datos de la provincia, y elimina duplicados con el metodo 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
  getProvincias(): Observable<any | any[]> {
    //El query que pide que solo retorne el nombre y el código de las provincias
    const query = `where=1%3D1&outFields=NOM_PROV,COD_PROV`;
    //Se juntan las cadenas de texto para formar el URL
    const url = `${this.apiUrl}?${query}&returnGeometry=false&outSR=4326&f=json`;
    //Se hace el llamado al URL para que retorne la información basada en lo solicitado junto al URL, y se eliminan duplicados con el método 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
    return this.http.get<any>(url).pipe(
      //En 'provincias' se guarda el valor que viene dentro de response.features.attributes de la respuesta del API (contiene la información solicitada de la provincia) en un campo individual de un array, para se ahí ser enviados a 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
      map(response => {
        const provincias = response.features.map((feature: any) => feature.attributes);
        return this.removerDuplicados(provincias, 'COD_PROV');
      }),
      //Y este 'metodo' utiliza '.sort' y '.localeCompare' para ordernar los valoes en órden alfabético para mayor comodidad visual
      map(provincias => provincias.sort((a: any, b: any) => a.COD_PROV.localeCompare(b.COD_PROV)))
    );
  }

 //Este método obtiene todos los cantones filtados por codigo de provncia 'COD_PROV', espécifica que solo traiga 'NOM_CANT' (nombre) y 'COD_CANT' (codigo) porque son los datos del canton, y elimina duplicados con el metodo 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
 getCantonesPorProvincia(COD_PROV: string): Observable<any | any[]> {
  //El query que pide que solo retorne el nombre y el código del canton, además de filtrar solo los cantones que pertencen a la provincia con código = COD_PROV 
    const query = `where=COD_PROV%20%3D%20%27${COD_PROV}%27&outFields=NOM_CANT,COD_CANT`;
    //Se juntan las cadenas de texto para formar el URL
    const url = `${this.apiUrl}?${query}&returnGeometry=false&outSR=4326&f=json`;
    //Se hace el llamado al URL para que retorne la información basada en lo solicitado junto al URL, y se eliminan duplicados con el método 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
    return this.http.get<any>(url).pipe(
      //En 'cantones' se guarda el valor que viene dentro de response.features.attributes de la respuesta del API (contiene la información solicitada del canton) en un campo individual de un array, para se ahí ser enviados a 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
      map(response => {
        const cantones = response.features.map((feature: any) => feature.attributes);
        return this.removerDuplicados(cantones, 'COD_CANT');
      }),
      //Y este 'metodo' utiliza '.sort' y '.localeCompare' para ordernar los valoes en órden alfabético para mayor comodidad visual
      map(cantones => cantones.sort((a: any, b: any) => a.COD_CANT.localeCompare(b.COD_CANT)))
    );
  }
  
  //Este método obtiene todos los distritos filtados por codigo de provncia 'COD_PROV' y codigo de canton 'COD_CANT', espécifica que solo traiga 'NOM_DIST' (nombre) y 'COD_DIST' (codigo) porque son los datos del distrito, y elimina duplicados con el metodo 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
  getDistritosPorCantonProvincia(COD_PROV: string, COD_CANT: string): Observable<any | any[]> {
    //El query que pide que solo retorne el nombre y el código del distrito, además de filtrar solo los distrtos que pertencen a la provincia con código = COD_PROV y al canton con codigo = COD_CANT
    const query = `where=COD_PROV%20%3D%20%27${COD_PROV}%27%20AND%20COD_CANT%20%3D%20%27${COD_CANT}%27&outFields=NOM_DIST,COD_DIST`;
    //Se juntan las cadenas de texto para formar el URL
    const url = `${this.apiUrl}?${query}&returnGeometry=false&outSR=4326&f=json`;
    //Se hace el llamado al URL para que retorne la información basada en lo solicitado junto al URL, y se eliminan duplicados con el método 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
    return this.http.get<any>(url).pipe(
      //En 'distritos' se guarda el valor que viene dentro de response.features.attributes de la respuesta del API (contiene la información solicitada del distrito) en un campo individual de un array, para se ahí ser enviados a 'removerDuplicados', además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
      map(response => {
        const distritos = response.features.map((feature: any) => feature.attributes);
        return this.removerDuplicados(distritos, 'COD_DIST');
      }),
      //Y este 'metodo' utiliza '.sort' y '.localeCompare' para ordernar los valoes en órden alfabético para mayor comodidad visual
      map(distritos => distritos.sort((a: any, b: any) => a.COD_DIST.localeCompare(b.COD_DIST)))
    );
  }

  //Este método se encarga de remover todos los elementos duplicados que lleguen del api flitrados por 'key' que se le diga, además de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
  private removerDuplicados(array: any[], key: string): any[] {
    //'.reduce' lo que hace es recorrer el 'array' e ir acomodando los resultados en un array nuevo ('result' es el nuevo 'array') ('actual' es el item que es está procesando por iteración del array)
    return array.reduce((result, actual) => {
      //'.find' se usa para buscar el item que está siendo procesado ya existe en 'result'
      const x = result.find(item => item[key] === actual[key]);
      //Si no existe lo agrega a 'result'
      //Si ya exsite lo ignora
      if (!x) {
        //Filtra dependiendo de qué información se está trabajando para poder formatear los nombres correctamente dependiendo si es provincia, canton o distrito
        switch(key) {
          case 'COD_PROV':
            actual.NOM_PROV = this.corregirFormato(actual.NOM_PROV);
            break;
          case 'COD_CANT':
            actual.NOM_CANT = this.corregirFormato(actual.NOM_CANT);
            break;
          case 'COD_DIST':
            actual.NOM_DIST = this.corregirFormato(actual.NOM_DIST);
            break;
        }
        return result.concat([actual]);
      } else {
        return result;
      }
      //Inicialización vacía de 'result'
    }, []);
  }

  //Este método se encarga de cambiar el formato de como está escrito el nombre a que solo tenga la primera letra de cada palabra en mayúscula
  private corregirFormato(provincia: string): string {
    return provincia.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
  }
}
