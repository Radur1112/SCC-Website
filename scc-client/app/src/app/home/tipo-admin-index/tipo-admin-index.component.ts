import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tipo-admin-index',
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
    MatIconModule, 
    MatCardModule, 
    MatTooltipModule, 
    MatSelectModule],
  templateUrl: './tipo-admin-index.component.html',
  styleUrl: './tipo-admin-index.component.scss'
})
export class TipoAdminIndexComponent {

  selectedTipo: any;
  tipos: any;

  loading: boolean = true;

  constructor(private gService:GenericService,
    private authService: AuthService,
    private router:Router,
    private dialog: MatDialog
  ){
    this.getTipoThings();
  }

  getTipoThings() {

  }

  openTipoFormDialog(idTipo: any) {

  }
}
