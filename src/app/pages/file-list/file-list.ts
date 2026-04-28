import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Api } from '../../services/api';
import { ContentViewer } from '../content-viewer/content-viewer';

@Component({
  selector: 'app-file-list',
  imports: [RouterLink, ContentViewer],
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
})
export class FileList implements OnInit {
  private api = inject(Api);
  protected fileList = signal<
    { url: string; type: string; key: string }[]
  >([]);
  protected contentOpen = false;
  protected currentFile = { url: '', type: '', key: '' };

  openContent(file: { url: string; type: string; key: string }) {
    this.contentOpen = true;
    this.currentFile = file;
  }

  closeContent() {
    this.contentOpen = false;
    this.currentFile = { url: '', type: '', key: '' };
  }

  async ngOnInit() {
    this.fileList.set(await this.getFileList());
  }

  async deleteFile(fileKey: string) {
    try {
      const success = await this.api.deleteFile(fileKey);
      if (success) {
        const updatedList = await this.api.getFileList();
        this.fileList.set(updatedList);
      }
    } catch (error) {
      console.error('error deleting file', { error });
    }
  }

  async getFileList() {
    try {
      return await this.api.getFileList();
    } catch (error: any) {
      console.error('error getting file list', { error });
      return [];
    }
  }
}
