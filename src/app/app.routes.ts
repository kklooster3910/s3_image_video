import { Routes } from '@angular/router';

import { VideoList } from './pages/video-list/video-list';
import { FileList } from './pages/file-list/file-list';
import { Upload } from './pages/upload/upload';

export const routes: Routes = [
  { path: '', redirectTo: '/file-list', pathMatch: 'full' },
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'video-list', component: VideoList },
  { path: 'file-list', component: FileList },
  { path: 'upload', component: Upload },
];
