import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatListModule],
  templateUrl: './sobre-nosotros.component.html',
  styleUrl: './sobre-nosotros.component.scss'
})
export class SobreNosotrosComponent {

}
