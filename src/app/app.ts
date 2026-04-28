import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Login } from './components/login/login';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private api = inject(Api);
  isAuthed = this.api.isAuthed;

  logout() {
    this.api.setAuthed('');
  }
}
