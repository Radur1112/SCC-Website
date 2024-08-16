import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenericService } from '../../services/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule, MatListModule, MatDividerModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  private intervalId: any;

  usuarioActual: any;
  
  isAdmin: boolean;
  isSupervisor: boolean;
  isCapacitador: boolean;
  isPlanillero: boolean;
  isVacaciones: boolean;

  notificaciones: any[] = [];
  notificacionesNoLeidas: any[] = [];
  
  constructor(
    private gService: GenericService,
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
        this.isVacaciones = this.usuarioActual.vacacion != null && !isNaN(Number(this.usuarioActual.vacacion));

        this.startNotificationPolling();
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

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  collapseNavbar(): void {
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
    const navbarCollapse = document.querySelector('.navbar-collapse') as HTMLElement;

    if (navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
      navbarToggler.setAttribute('aria-expanded', 'false');
      navbarToggler.classList.add('collapsed');
    }
  }

  startNotificationPolling(): void {
    this.getNotificaciones();

    this.intervalId = setInterval(() => {
      this.getNotificaciones();
    }, 300000);
  }

  getNotificaciones() {
    this.gService.get(`notificacion/usuario/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.notificaciones = res.data;
        this.notificacionesNoLeidas = this.notificaciones.filter(n => n.leido == 0);
      }
    });
  }

  verNotificaciones() {
    this.gService.get(`notificacion/leido/usuario/${this.usuarioActual.id}`)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        this.getNotificaciones();
      }
    });
  }

  redireccionar(route: any) {
    this.router.navigate([route, this.usuarioActual.id]);
  }
}
