import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatLabel,
  MatError,
} from '@angular/material/form-field';
import {
  FileInputDirective,
  FileInputValidators,
  FileInputValue,
} from '@ngx-dropzone/cdk';
import { MatDropzone } from '@ngx-dropzone/material';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { Api } from '../../services/api';

@Component({
  selector: 'app-upload',
  imports: [
    ReactiveFormsModule,
    FileInputDirective,
    MatDropzone,
    MatFormField,
    MatLabel,
    MatIcon,
    MatIconModule,
    MatError,
    MatChipsModule,
    MatProgressSpinner,
  ],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload {
  protected api = inject(Api);
  protected router = inject(Router);
  protected isLoading = signal<boolean>(false);

  getFiles(): File[] {
    const files = this.fileCtrl.value;
    if (!files) return [];
    return Array.isArray(files) ? files : [files];
  }

  fileCtrl = new FormControl<FileInputValue | null>(null, [
    Validators.required,
    FileInputValidators.accept('image/*, video/*'),
    FileInputValidators.maxSize(1500 * 1024 * 1024),
  ]);

  async upload() {
    this.fileCtrl.markAsTouched();
    this.isLoading.set(true);
    try {
      const files = this.fileCtrl.value;
      const success = await this.api.upload(files);
      if (success) this.router.navigate(['/file-list']);
    } catch (error) {
      console.log('error uploading files', { error });
      this.isLoading.set(false);
    }
  }

  removeFile(file: File) {
    if (Array.isArray(this.fileCtrl.value)) {
      const currentFiles = this.fileCtrl.value;
      const updatedFiles = currentFiles.filter((f) => f != file);
      this.fileCtrl.setValue(updatedFiles);
    }
  }
}
