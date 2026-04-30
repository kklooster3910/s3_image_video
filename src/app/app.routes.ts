import { Routes } from '@angular/router';

import { FileList } from './pages/file-list/file-list';
import { Upload } from './pages/upload/upload';

export const routes: Routes = [
  { path: '', redirectTo: '/file-list', pathMatch: 'full' },
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'file-list', component: FileList },
  { path: 'upload', component: Upload },
];
