import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatAccordion, MatExpansionModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

}
