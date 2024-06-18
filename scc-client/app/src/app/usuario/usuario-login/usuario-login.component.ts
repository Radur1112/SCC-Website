import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-usuario-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule],
  templateUrl: './usuario-login.component.html',
  styleUrl: './usuario-login.component.scss'
})
export class UsuarioLoginComponent {
  loginForm: FormGroup

  esconderPassword = true;
  
  
  constructor(
    private fb: FormBuilder
  ) {
    this.reactiveForm();
  }
  
  reactiveForm() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      password: ['', Validators.required],
    });
  }
  
  public errorHandling = (control: string, error: string) => {
    return this.loginForm.controls[control].hasError(error);
  };

  login() {

  }
}
