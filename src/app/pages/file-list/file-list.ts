import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { Api } from '../../services/api';
import { ContentViewer } from '../content-viewer/content-viewer';

type FileListType = {
  url: string;
  type: string;
  key: string;
  lastModified: string;
};

@Component({
  selector: 'app-file-list',
  imports: [
    ContentViewer,
    MatProgressSpinner,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
})
export class FileList implements OnInit {
  protected api = inject(Api);
  protected fullList: FileListType[] = [];
  protected activeSort: 'clear' | 'file name' | 'date created' = 'clear';
  protected activeFilter: 'all' | 'video' | 'image' = 'all';
  protected fileList = signal<FileListType[]>([]);
  protected contentOpen = false;
  protected currentFile = {
    url: '',
    type: '',
    key: '',
    lastModified: '',
  };
  protected isLoading = signal<boolean>(false);
  protected isTryingToDelete = signal<boolean>(false);
  protected filterOptions: string[] = ['All', 'Video', 'Image'];
  protected sortOptions: string[] = ['Clear', 'File Name', 'Date Created'];
  protected keyToIndex = new Map<string, number>();
  protected pendingDeleteKey: string = '';

  setPendingDeleteKey(key: string) {
    this.pendingDeleteKey = key;
  }

  deleteAttempt(attemptType: boolean) {
    this.isTryingToDelete.set(attemptType);
  }

  buildIndexMap() {
    this.keyToIndex.clear();
    this.fileList().forEach((file, idx) => {
      this.keyToIndex.set(file.key, idx);
    });
  }

  openContent(file: FileListType) {
    this.contentOpen = true;
    this.currentFile = file;
  }

  closeContent() {
    this.contentOpen = false;
    this.currentFile = {
      url: '',
      type: '',
      key: '',
      lastModified: '',
    };
  }

  applyView() {
    let view = [...this.fullList];

    if (this.activeFilter !== 'all') {
      view = view.filter((file) =>
        this.activeFilter === 'video'
          ? file.type === 'vid'
          : file.type === 'img',
      );
    }

    if (this.activeSort === 'file name') {
      view.sort((a, b) => a.key.localeCompare(b.key));
    } else if (this.activeSort === 'date created') {
      view.sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime(),
      );
    }

    this.fileList.set(view);
    this.buildIndexMap();
  }

  contentScroll(direction: string) {
    const currentPosition = this.keyToIndex.get(this.currentFile.key);
    const isLastOrFirstElement =
      (currentPosition === 0 && direction === 'prev') ||
      (currentPosition === this.fileList().length - 1 &&
        direction === 'next');
    if (
      isLastOrFirstElement ||
      currentPosition === undefined ||
      currentPosition === null
    )
      return;
    const nextIdx =
      direction === 'next' ? currentPosition + 1 : currentPosition - 1;
    this.currentFile = this.fileList()[nextIdx];
  }

  filter(choice: any) {
    const value =
      choice?.value.toLowerCase() ?? ('all' as 'all' | 'video' | 'image');

    this.activeFilter = value;
    this.applyView();
  }

  sort(choice: any) {
    const value =
      choice?.value.toLowerCase() ??
      ('clear' as 'clear' | 'file name' | 'date created');

    this.activeSort = value;
    this.applyView();
  }

  async ngOnInit() {
    const fileList = await this.getFileList();
    this.fullList = fileList;
    this.applyView();
  }

  async deleteFile() {
    try {
      this.isLoading.set(true);
      const success = await this.api.deleteFile(this.pendingDeleteKey);
      if (success) {
        const updatedList = await this.api.getFileList();
        this.fullList = updatedList;
        this.applyView();
        this.pendingDeleteKey = '';
      }
    } catch (error) {
      this.pendingDeleteKey = '';
      console.error('error deleting file', { error });
    }
  }

  async getFileList() {
    this.isLoading.set(true);
    try {
      const success = await this.api.getFileList();
      this.isLoading.set(false);
      return success;
    } catch (error: any) {
      this.isLoading.set(false);
      console.error('error getting file list', { error });
      return [];
    }
  }
}
