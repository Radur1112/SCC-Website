import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  
  redirectToPage(url: string): void {
    window.open(url, '_blank');
  }
}
