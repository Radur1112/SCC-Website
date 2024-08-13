import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  usuarioActual: any;
  
  isAdmin: boolean;
  isSupervisor: boolean;
  isCapacitador: boolean;
  isPlanillero: boolean;
  isVacaciones: boolean;
  
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    
  }

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((x) => {
      if (x && Object.keys(x).length !== 0) {
        this.usuarioActual = x.usuario;
        this.isAdmin = this.usuarioActual.idTipoUsuario == 1;
        this.isSupervisor = this.usuarioActual.idTipoUsuario == 3 || this.usuarioActual.idTipoUsuario == 1;
        this.isCapacitador = this.usuarioActual.idTipoUsuario == 4 || this.usuarioActual.idTipoUsuario == 1;
        this.isPlanillero = this.usuarioActual.idTipoUsuario == 5 || this.usuarioActual.idTipoUsuario == 1;
        this.isPlanillero = this.usuarioActual.idTipoUsuario == 5 || this.usuarioActual.idTipoUsuario == 1;
        this.isVacaciones = this.usuarioActual.vacacion != null && !isNaN(Number(this.usuarioActual.vacacion))
      } else {
        this.usuarioActual = null;
        this.isAdmin = false;
        this.isSupervisor = false;
        this.isCapacitador = false;
        this.isPlanillero = false;
        this.isVacaciones = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  collapseNavbar(): void {
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
    const navbarCollapse = document.querySelector('.navbar-collapse') as HTMLElement;

    // Check if the navbar collapse is currently open
    if (navbarCollapse.classList.contains('show')) {
      // Close the navbar collapse
      navbarCollapse.classList.remove('show');
      // Toggle the 'collapsed' state of the toggler button
      navbarToggler.setAttribute('aria-expanded', 'false');
      navbarToggler.classList.add('collapsed');
    }
  }

  redireccionar(route: any) {
    this.router.navigate([route, this.usuarioActual.id]);
  }
}
