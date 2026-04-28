import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Api } from '../../services/api';

// maybe put this in a types dir lol
export type LoginCredentials = {
  username: string | null | undefined;
  password: string | null | undefined;
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private api = inject(Api);
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  async login() {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const { username, password } = this.form.value;
      try {
        const response = await this.api.loginRequest({
          username,
          password,
        });
        this.api.setAuthed(response.token);
        this.router.navigate(['/file-list']);
      } catch (error: any) {
        if (error.status === 401) {
          this.form.setErrors({ invalidCredentials: true });
          this.api.setAuthed('');
        }
      }
    }
  }
}
