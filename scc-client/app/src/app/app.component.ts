import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './core/core.module';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "./core/header/header.component";
import { FooterComponent } from "./core/footer/footer.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [CommonModule, RouterOutlet, RouterModule, RouterLink, CoreModule, HeaderComponent, FooterComponent, MatIconModule, MatButtonModule]
})
export class AppComponent {
  title = 'SCC';

}
